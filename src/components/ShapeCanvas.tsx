import { useEffect, useRef, useState } from 'react';
import type { AngleMeasurement, GuideMode, Point, ShapeMode, SideMeasurement } from '../types';
import { CANVAS_STAGE } from '../lib/canvasStage';
import { clampPointToRect, polygonCentroid } from '../lib/geometry';

type ShapeCanvasProps = {
  mode: ShapeMode;
  points: Point[];
  sideMeasurements: SideMeasurement[];
  angleMeasurements: AngleMeasurement[];
  activeClassificationIds: string[];
  guideMode: GuideMode;
  onChangePoints: (points: Point[]) => void;
};

const STAGE_WIDTH = CANVAS_STAGE.width;
const STAGE_HEIGHT = CANVAS_STAGE.height;
const HANDLE_RADIUS = 13;
const HIT_RADIUS = 28;
const PADDING = 28;
const LABELS = ['A', 'B', 'C', 'D'];

function getCanvasPoint(event: React.PointerEvent<HTMLCanvasElement>): Point {
  const rect = event.currentTarget.getBoundingClientRect();

  return {
    x: ((event.clientX - rect.left) / rect.width) * STAGE_WIDTH,
    y: ((event.clientY - rect.top) / rect.height) * STAGE_HEIGHT,
  };
}

function snapPointToGrid(point: Point, gridSize = 20): Point {
  return {
    x: Math.round(point.x / gridSize) * gridSize,
    y: Math.round(point.y / gridSize) * gridSize,
  };
}

function drawGrid(ctx: CanvasRenderingContext2D) {
  ctx.save();
  ctx.strokeStyle = '#dbe7f3';
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.65;

  for (let x = 40; x < STAGE_WIDTH; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, STAGE_HEIGHT);
    ctx.stroke();
  }

  for (let y = 40; y < STAGE_HEIGHT; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(STAGE_WIDTH, y);
    ctx.stroke();
  }

  ctx.restore();
}

function drawRightAngleMarker(ctx: CanvasRenderingContext2D, previous: Point, vertex: Point, next: Point) {
  const markerSize = 28;
  const unitA = normalize({ x: previous.x - vertex.x, y: previous.y - vertex.y });
  const unitB = normalize({ x: next.x - vertex.x, y: next.y - vertex.y });
  const p1 = { x: vertex.x + unitA.x * markerSize, y: vertex.y + unitA.y * markerSize };
  const p2 = {
    x: p1.x + unitB.x * markerSize,
    y: p1.y + unitB.y * markerSize,
  };
  const p3 = { x: vertex.x + unitB.x * markerSize, y: vertex.y + unitB.y * markerSize };

  ctx.save();
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.lineTo(p3.x, p3.y);
  ctx.stroke();
  ctx.restore();
}

function normalize(vector: Point): Point {
  const magnitude = Math.hypot(vector.x, vector.y);

  if (magnitude === 0) {
    return { x: 0, y: 0 };
  }

  return {
    x: vector.x / magnitude,
    y: vector.y / magnitude,
  };
}

function drawShape(
  ctx: CanvasRenderingContext2D,
  mode: ShapeMode,
  points: Point[],
  sideMeasurements: SideMeasurement[],
  angleMeasurements: AngleMeasurement[],
  activeClassificationIds: string[],
  draggingIndex: number | null,
) {
  ctx.clearRect(0, 0, STAGE_WIDTH, STAGE_HEIGHT);
  drawGrid(ctx);

  const centroid = polygonCentroid(points);
  const isSpecial = activeClassificationIds.length > 0;
  const fill = mode === 'triangle' ? 'rgba(37, 99, 235, 0.14)' : 'rgba(20, 184, 166, 0.15)';
  const stroke = isSpecial ? '#ef4444' : mode === 'triangle' ? '#2563eb' : '#0f766e';

  ctx.save();
  ctx.beginPath();
  points.forEach((point, index) => {
    if (index === 0) {
      ctx.moveTo(point.x, point.y);
    } else {
      ctx.lineTo(point.x, point.y);
    }
  });
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.lineWidth = 5;
  ctx.lineJoin = 'round';
  ctx.strokeStyle = stroke;
  ctx.stroke();
  ctx.restore();

  sideMeasurements.forEach((side, index) => {
    const from = points[index];
    const to = points[(index + 1) % points.length];

    if (side.isEqualHighlight) {
      ctx.save();
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.globalAlpha = 0.82;
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
      ctx.restore();
    }

    const labelPoint = offsetFromCentroid(side.midpoint, centroid, 22);
    drawPillLabel(ctx, labelPoint, `${side.lengthUnits.toFixed(1)}`, side.isEqualHighlight);
  });

  angleMeasurements.forEach((angle, index) => {
    const previous = points[(index - 1 + points.length) % points.length];
    const next = points[(index + 1) % points.length];
    const labelPoint = offsetFromCentroid(angle.vertex, centroid, -46);

    if (angle.isRight) {
      drawRightAngleMarker(ctx, previous, angle.vertex, next);
    }

    drawPillLabel(ctx, labelPoint, `${angle.displayDegrees}°`, angle.isRight);
  });

  points.forEach((point, index) => {
    const isDragging = draggingIndex === index;

    ctx.save();
    ctx.shadowColor = 'rgba(15, 23, 42, 0.25)';
    ctx.shadowBlur = isDragging ? 16 : 8;
    ctx.shadowOffsetY = 4;
    ctx.fillStyle = isDragging ? '#f97316' : '#ffffff';
    ctx.strokeStyle = isDragging ? '#c2410c' : '#0f172a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(point.x, point.y, HANDLE_RADIUS + (isDragging ? 2 : 0), 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.fillStyle = isDragging ? '#ffffff' : '#0f172a';
    ctx.font = '700 15px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(LABELS[index], point.x, point.y);
    ctx.restore();
  });
}

function drawPillLabel(ctx: CanvasRenderingContext2D, point: Point, text: string, hot: boolean) {
  ctx.save();
  ctx.font = '700 15px Inter, system-ui, sans-serif';
  const width = ctx.measureText(text).width + 22;
  const height = 28;
  const x = point.x - width / 2;
  const y = point.y - height / 2;

  ctx.fillStyle = hot ? '#fee2e2' : '#ffffff';
  ctx.strokeStyle = hot ? '#ef4444' : '#bfdbfe';
  ctx.lineWidth = 2;
  roundRect(ctx, x, y, width, height, 14);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = hot ? '#b91c1c' : '#1e3a8a';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, point.x, point.y + 1);
  ctx.restore();
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

function offsetFromCentroid(point: Point, centroid: Point, amount: number): Point {
  const vector = normalize({ x: point.x - centroid.x, y: point.y - centroid.y });

  return {
    x: point.x + vector.x * amount,
    y: point.y + vector.y * amount,
  };
}

export function ShapeCanvas({
  mode,
  points,
  sideMeasurements,
  angleMeasurements,
  activeClassificationIds,
  guideMode,
  onChangePoints,
}: ShapeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const context = canvas.getContext('2d');

    if (!context) {
      return;
    }

    const dpr = window.devicePixelRatio || 1;
    canvas.width = STAGE_WIDTH * dpr;
    canvas.height = STAGE_HEIGHT * dpr;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawShape(
      context,
      mode,
      points,
      sideMeasurements,
      angleMeasurements,
      activeClassificationIds,
      draggingIndex,
    );
  }, [activeClassificationIds, angleMeasurements, draggingIndex, mode, points, sideMeasurements]);

  function findNearestVertex(point: Point): number | null {
    const index = points.findIndex((vertex) => Math.hypot(vertex.x - point.x, vertex.y - point.y) <= HIT_RADIUS);

    return index === -1 ? null : index;
  }

  function handlePointerDown(event: React.PointerEvent<HTMLCanvasElement>) {
    const point = getCanvasPoint(event);
    const index = findNearestVertex(point);

    if (index === null) {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    setDraggingIndex(index);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLCanvasElement>) {
    if (draggingIndex === null) {
      return;
    }

    const rawPoint = getCanvasPoint(event);
    const guidedPoint = guideMode === 'magnetic' ? snapPointToGrid(rawPoint) : rawPoint;
    const point = clampPointToRect(guidedPoint, STAGE_WIDTH, STAGE_HEIGHT, PADDING);
    const nextPoints = points.map((vertex, index) => (index === draggingIndex ? point : vertex));
    onChangePoints(nextPoints);
  }

  function handlePointerEnd(event: React.PointerEvent<HTMLCanvasElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    setDraggingIndex(null);
  }

  return (
    <div className="canvas-shell">
      <canvas
        aria-label="꼭짓점을 끌어서 도형을 바꾸는 그리기 영역"
        className="shape-canvas"
        height={STAGE_HEIGHT}
        onPointerCancel={handlePointerEnd}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        ref={canvasRef}
        role="img"
        width={STAGE_WIDTH}
      />
      <p className="canvas-caption">
        꼭짓점 A, B, C{mode === 'quadrilateral' ? ', D' : ''}를 끌면 길이와 각도가 바로 바뀝니다.
      </p>
    </div>
  );
}
