import type { Point } from '../types';

export function createDefaultTriangle(width: number, height: number): Point[] {
  return [
    { x: width * 0.21, y: height * 0.72 },
    { x: width * 0.43, y: height * 0.2 },
    { x: width * 0.82, y: height * 0.64 },
  ];
}

export function createDefaultQuadrilateral(width: number, height: number): Point[] {
  return [
    { x: width * 0.23, y: height * 0.26 },
    { x: width * 0.76, y: height * 0.3 },
    { x: width * 0.68, y: height * 0.71 },
    { x: width * 0.3, y: height * 0.78 },
  ];
}
