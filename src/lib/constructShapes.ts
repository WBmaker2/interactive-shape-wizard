import type { Point } from '../types';

type TrianglePoints = [Point, Point, Point];
type QuadrilateralPoints = [Point, Point, Point, Point];

export function constructSquare(center: Point, sidePx: number): QuadrilateralPoints {
  const half = sidePx / 2;

  return [
    { x: center.x - half, y: center.y - half },
    { x: center.x + half, y: center.y - half },
    { x: center.x + half, y: center.y + half },
    { x: center.x - half, y: center.y + half },
  ];
}

export function constructRectangle(center: Point, widthPx: number, heightPx: number): QuadrilateralPoints {
  const halfWidth = widthPx / 2;
  const halfHeight = heightPx / 2;

  return [
    { x: center.x - halfWidth, y: center.y - halfHeight },
    { x: center.x + halfWidth, y: center.y - halfHeight },
    { x: center.x + halfWidth, y: center.y + halfHeight },
    { x: center.x - halfWidth, y: center.y + halfHeight },
  ];
}

export function constructRhombus(center: Point, sidePx: number): QuadrilateralPoints {
  const diagonalHalf = sidePx / Math.sqrt(2);

  return [
    { x: center.x, y: center.y - diagonalHalf },
    { x: center.x + diagonalHalf, y: center.y },
    { x: center.x, y: center.y + diagonalHalf },
    { x: center.x - diagonalHalf, y: center.y },
  ];
}

export function constructEquilateralTriangle(center: Point, sidePx: number): TrianglePoints {
  const height = (Math.sqrt(3) / 2) * sidePx;

  return [
    { x: center.x, y: center.y - (2 * height) / 3 },
    { x: center.x + sidePx / 2, y: center.y + height / 3 },
    { x: center.x - sidePx / 2, y: center.y + height / 3 },
  ];
}

export function constructIsoscelesTriangle(
  center: Point,
  widthPx: number,
  heightPx: number,
): TrianglePoints {
  return [
    { x: center.x, y: center.y - (2 * heightPx) / 3 },
    { x: center.x + widthPx / 2, y: center.y + heightPx / 3 },
    { x: center.x - widthPx / 2, y: center.y + heightPx / 3 },
  ];
}

export function constructRightTriangle(center: Point, sidePx: number): TrianglePoints {
  return [
    { x: center.x - sidePx / 3, y: center.y - sidePx / 3 },
    { x: center.x + (2 * sidePx) / 3, y: center.y - sidePx / 3 },
    { x: center.x - sidePx / 3, y: center.y + (2 * sidePx) / 3 },
  ];
}
