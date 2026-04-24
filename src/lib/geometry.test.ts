import { describe, expect, it } from 'vitest';
import {
  angleAt,
  areLengthsClose,
  areSegmentsParallel,
  clampPointToRect,
  distance,
  getAngleMeasurements,
  getDisplayedAngles,
  getSideMeasurements,
  areDisplayedLengthsEqual,
  isDisplayedRightAngle,
  midpoint,
  toDisplayedAngleDegreeSet,
  toDisplayedAngleDegrees,
  toDisplayedLengthUnits,
  toUnits,
} from './geometry';

describe('geometry helpers', () => {
  it('calculates distance and classroom units', () => {
    expect(distance({ x: 0, y: 0 }, { x: 30, y: 40 })).toBe(50);
    expect(toUnits(126)).toBe(12.6);
  });

  it('compares lengths and angles using displayed values for strict classification', () => {
    expect(toDisplayedLengthUnits(240)).toBe(24);
    expect(toDisplayedLengthUnits(241)).toBe(24.1);
    expect(areDisplayedLengthsEqual(240, 241)).toBe(false);
    expect(areDisplayedLengthsEqual(240, 240.4)).toBe(true);
    expect(toDisplayedAngleDegrees(89.4)).toBe(89);
    expect(isDisplayedRightAngle(89.4)).toBe(false);
    expect(isDisplayedRightAngle(89.6)).toBe(true);
  });

  it('calculates midpoint', () => {
    expect(midpoint({ x: 2, y: 4 }, { x: 8, y: 10 })).toEqual({ x: 5, y: 7 });
  });

  it('calculates angle at a vertex', () => {
    const angle = angleAt({ x: 0, y: 10 }, { x: 0, y: 0 }, { x: 10, y: 0 });

    expect(angle).toBeCloseTo(90, 5);
  });

  it('detects close lengths with classroom tolerance', () => {
    expect(areLengthsClose(100, 104)).toBe(true);
    expect(areLengthsClose(100, 112)).toBe(false);
  });

  it('detects parallel segments', () => {
    expect(
      areSegmentsParallel({ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 0, y: 4 }, { x: 10, y: 4 }),
    ).toBe(true);
  });

  it('clamps points inside the canvas', () => {
    expect(clampPointToRect({ x: -20, y: 500 }, 300, 200, 24)).toEqual({ x: 24, y: 176 });
  });

  it('derives side and angle measurements', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 100 },
      { x: 0, y: 100 },
    ];

    expect(getSideMeasurements(points)).toHaveLength(4);
    expect(getAngleMeasurements(points)).toHaveLength(4);
    expect(getAngleMeasurements(points)[0].isRight).toBe(true);
  });

  it('keeps displayed triangle angles mathematically consistent after rounding', () => {
    const displayed = toDisplayedAngleDegreeSet([60.51, 59.745, 59.745]);

    expect(displayed.reduce((sum, angle) => sum + angle, 0)).toBe(180);
  });

  it('keeps equal exact angles equal while preserving the triangle angle sum', () => {
    const displayed = toDisplayedAngleDegreeSet([112.8, 33.6, 33.6]);

    expect(displayed.reduce((sum, angle) => sum + angle, 0)).toBe(180);
    expect(displayed[1]).toBe(displayed[2]);
  });

  it('uses display-safe angles for point measurements', () => {
    const points = [
      { x: 380, y: 176 },
      { x: 520, y: 416 },
      { x: 240, y: 416 },
    ];

    expect(getDisplayedAngles(points).reduce((sum, angle) => sum + angle, 0)).toBe(180);
  });
});
