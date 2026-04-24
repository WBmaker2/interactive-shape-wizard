import type { AngleMeasurement, Point, SideMeasurement } from '../types';

export const UNIT_SCALE_PX = 10;
export const RIGHT_ANGLE_DEGREES = 90;
export const RIGHT_ANGLE_TOLERANCE = 3;
export const PARALLEL_TOLERANCE = 4;

const LABELS = ['A', 'B', 'C', 'D'];

export function distance(a: Point, b: Point): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

export function toUnits(px: number): number {
  return toDisplayedLengthUnits(px);
}

export function toDisplayedLengthUnits(px: number): number {
  return Math.round((px / UNIT_SCALE_PX) * 10) / 10;
}

export function toDisplayedAngleDegrees(degrees: number): number {
  return Math.round(degrees);
}

export function getInteriorAngleTotal(pointCount: number): number {
  return pointCount >= 3 ? (pointCount - 2) * 180 : 0;
}

function groupEqualAngles(degrees: number[]): number[][] {
  const groups: number[][] = [];
  const used = new Set<number>();

  degrees.forEach((degreesValue, index) => {
    if (used.has(index)) {
      return;
    }

    const group = [index];
    used.add(index);

    degrees.forEach((otherDegrees, otherIndex) => {
      if (used.has(otherIndex)) {
        return;
      }

      if (Math.abs(degreesValue - otherDegrees) <= 0.001) {
        group.push(otherIndex);
        used.add(otherIndex);
      }
    });

    groups.push(group);
  });

  return groups;
}

function getDisplayAngleCandidates(degrees: number): number[] {
  const center = toDisplayedAngleDegrees(degrees);
  const candidates = new Set<number>();

  for (let offset = 0; offset <= 4; offset += 1) {
    candidates.add(center - offset);
    candidates.add(center + offset);
  }

  return [...candidates]
    .filter((candidate) => candidate >= 0 && candidate <= 360)
    .sort((a, b) => Math.abs(a - center) - Math.abs(b - center) || a - b);
}

export function toDisplayedAngleDegreeSet(
  degrees: number[],
  targetTotal = getInteriorAngleTotal(degrees.length),
): number[] {
  if (degrees.length === 0) {
    return [];
  }

  if (targetTotal <= 0) {
    return degrees.map(toDisplayedAngleDegrees);
  }

  const groups = groupEqualAngles(degrees);
  const groupCandidates = groups.map((group) => {
    const average = group.reduce((sum, index) => sum + degrees[index], 0) / group.length;
    return getDisplayAngleCandidates(average);
  });
  let bestDisplayByGroup: number[] | null = null;
  let bestCost = Number.POSITIVE_INFINITY;

  function search(groupIndex: number, displayByGroup: number[], total: number, cost: number) {
    if (cost > bestCost) {
      return;
    }

    if (groupIndex === groups.length) {
      if (total === targetTotal && cost < bestCost) {
        bestCost = cost;
        bestDisplayByGroup = [...displayByGroup];
      }
      return;
    }

    const group = groups[groupIndex];

    groupCandidates[groupIndex].forEach((displayDegrees) => {
      const nextTotal = total + displayDegrees * group.length;

      if (nextTotal > targetTotal + 4) {
        return;
      }

      const nextCost =
        cost +
        group.reduce((sum, angleIndex) => sum + (displayDegrees - degrees[angleIndex]) ** 2, 0);

      displayByGroup[groupIndex] = displayDegrees;
      search(groupIndex + 1, displayByGroup, nextTotal, nextCost);
    });
  }

  search(0, [], 0, 0);

  if (!bestDisplayByGroup) {
    return degrees.map(toDisplayedAngleDegrees);
  }

  const chosenDisplayByGroup = bestDisplayByGroup;
  const displayDegrees = Array.from<number>({ length: degrees.length });

  groups.forEach((group, groupIndex) => {
    group.forEach((angleIndex) => {
      displayDegrees[angleIndex] = chosenDisplayByGroup[groupIndex];
    });
  });

  return displayDegrees;
}

export function areDisplayedLengthsEqual(a: number, b: number): boolean {
  return toDisplayedLengthUnits(a) === toDisplayedLengthUnits(b);
}

export function isDisplayedRightAngle(degrees: number): boolean {
  return toDisplayedAngleDegrees(degrees) === RIGHT_ANGLE_DEGREES;
}

export function midpoint(a: Point, b: Point): Point {
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
  };
}

export function angleAt(previous: Point, vertex: Point, next: Point): number {
  const a = {
    x: previous.x - vertex.x,
    y: previous.y - vertex.y,
  };
  const b = {
    x: next.x - vertex.x,
    y: next.y - vertex.y,
  };
  const dot = a.x * b.x + a.y * b.y;
  const magnitude = Math.hypot(a.x, a.y) * Math.hypot(b.x, b.y);

  if (magnitude === 0) {
    return 0;
  }

  const cosine = Math.min(1, Math.max(-1, dot / magnitude));
  return (Math.acos(cosine) * 180) / Math.PI;
}

export function angleBetweenSegments(
  a1: Point,
  a2: Point,
  b1: Point,
  b2: Point,
): number {
  const angleA = Math.atan2(a2.y - a1.y, a2.x - a1.x);
  const angleB = Math.atan2(b2.y - b1.y, b2.x - b1.x);
  let diff = Math.abs(((angleA - angleB) * 180) / Math.PI) % 180;

  if (diff > 90) {
    diff = 180 - diff;
  }

  return diff;
}

export function areLengthsClose(a: number, b: number): boolean {
  const tolerance = Math.max(6, Math.max(a, b) * 0.04);
  return Math.abs(a - b) <= tolerance;
}

export function areAnglesClose(
  a: number,
  b: number,
  tolerance = RIGHT_ANGLE_TOLERANCE,
): boolean {
  return Math.abs(a - b) <= tolerance;
}

export function areSegmentsParallel(
  a1: Point,
  a2: Point,
  b1: Point,
  b2: Point,
): boolean {
  return angleBetweenSegments(a1, a2, b1, b2) <= PARALLEL_TOLERANCE;
}

export function clampPointToRect(
  point: Point,
  width: number,
  height: number,
  padding: number,
): Point {
  return {
    x: Math.min(width - padding, Math.max(padding, point.x)),
    y: Math.min(height - padding, Math.max(padding, point.y)),
  };
}

export function polygonCentroid(points: Point[]): Point {
  const total = points.reduce(
    (sum, point) => ({ x: sum.x + point.x, y: sum.y + point.y }),
    { x: 0, y: 0 },
  );

  return {
    x: total.x / points.length,
    y: total.y / points.length,
  };
}

export function getSideMeasurements(
  points: Point[],
  equalSideIndexes: number[] = [],
): SideMeasurement[] {
  return points.map((point, index) => {
    const nextIndex = (index + 1) % points.length;
    const next = points[nextIndex];
    const lengthPx = distance(point, next);

    return {
      id: `${LABELS[index]}${LABELS[nextIndex]}`,
      fromLabel: LABELS[index],
      toLabel: LABELS[nextIndex],
      lengthPx,
      lengthUnits: toUnits(lengthPx),
      midpoint: midpoint(point, next),
      isEqualHighlight: equalSideIndexes.includes(index),
    };
  });
}

export function getAngleMeasurements(points: Point[]): AngleMeasurement[] {
  const degreesByVertex = points.map((point, index) => {
    const previous = points[(index - 1 + points.length) % points.length];
    const next = points[(index + 1) % points.length];
    return angleAt(previous, point, next);
  });
  const displayDegreesByVertex = toDisplayedAngleDegreeSet(degreesByVertex);

  return points.map((point, index) => {
    const degrees = degreesByVertex[index];
    const displayDegrees = displayDegreesByVertex[index];
    return {
      id: LABELS[index],
      label: LABELS[index],
      degrees,
      displayDegrees,
      vertex: point,
      isRight: displayDegrees === RIGHT_ANGLE_DEGREES,
    };
  });
}

export function getSideLengths(points: Point[]): number[] {
  return points.map((point, index) => distance(point, points[(index + 1) % points.length]));
}

export function getAngles(points: Point[]): number[] {
  return getAngleMeasurements(points).map((angle) => angle.degrees);
}

export function getDisplayedAngles(points: Point[]): number[] {
  return getAngleMeasurements(points).map((angle) => angle.displayDegrees);
}

export function getEqualSideIndexes(points: Point[]): number[] {
  const lengths = getSideLengths(points);
  const highlighted = new Set<number>();

  lengths.forEach((length, index) => {
    lengths.forEach((other, otherIndex) => {
      if (index !== otherIndex && areDisplayedLengthsEqual(length, other)) {
        highlighted.add(index);
        highlighted.add(otherIndex);
      }
    });
  });

  return [...highlighted];
}
