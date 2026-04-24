import { describe, expect, it } from 'vitest';
import {
  classifyQuadrilateral,
  classifyTriangle,
  getQuadrilateralNearMissHints,
  getTriangleNearMissHints,
} from './classify';
import { getDisplayedAngles, getSideMeasurements } from './geometry';

describe('classifyTriangle', () => {
  it('detects equilateral and isosceles triangles', () => {
    const result = classifyTriangle([
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 50, y: 86.6 },
    ]);

    expect(result.map((item) => item.id)).toEqual(
      expect.arrayContaining(['equilateral-triangle', 'isosceles-triangle']),
    );
  });

  it('detects isosceles triangles', () => {
    const result = classifyTriangle([
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 50, y: 80 },
    ]);

    expect(result.map((item) => item.id)).toContain('isosceles-triangle');
  });

  it('detects right triangles', () => {
    const result = classifyTriangle([
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 0, y: 100 },
    ]);

    expect(result.map((item) => item.id)).toContain('right-triangle');
  });

  it('does not classify a general triangle', () => {
    const result = classifyTriangle([
      { x: 0, y: 0 },
      { x: 130, y: 20 },
      { x: 40, y: 90 },
    ]);

    expect(result).toEqual([]);
  });

  it('does not classify visibly uneven triangles as equilateral or isosceles', () => {
    const result = classifyTriangle([
      { x: 0, y: 0 },
      { x: 205, y: 0 },
      { x: 100, y: 175 },
    ]);

    expect(result.map((item) => item.id)).not.toContain('equilateral-triangle');
    expect(result.map((item) => item.id)).not.toContain('isosceles-triangle');
  });

  it('shows near-match hints separately for almost equilateral triangles', () => {
    const result = getTriangleNearMissHints([
      { x: 0, y: 0 },
      { x: 203, y: 0 },
      { x: 100, y: 175 },
    ]);

    expect(result.map((item) => item.id)).toContain('near-equilateral-triangle');
  });
});

describe('classifyQuadrilateral', () => {
  it('detects rectangles', () => {
    const result = classifyQuadrilateral([
      { x: 0, y: 0 },
      { x: 160, y: 0 },
      { x: 160, y: 90 },
      { x: 0, y: 90 },
    ]);

    expect(result.map((item) => item.id)).toContain('rectangle');
  });

  it('does not classify visible right-angle quadrilaterals as rectangles when opposite displayed sides differ', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 319, y: 0 },
      { x: 320, y: 200.5 },
      { x: 0, y: 200 },
    ] as const;
    const displayedSides = getSideMeasurements([...points]).map((side) => side.lengthUnits);
    const result = classifyQuadrilateral([...points]);

    expect(getDisplayedAngles([...points])).toEqual([90, 90, 90, 90]);
    expect(displayedSides).toEqual([31.9, 20.1, 32, 20]);
    expect(result).toEqual([]);
  });

  it('detects squares', () => {
    const result = classifyQuadrilateral([
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 100 },
      { x: 0, y: 100 },
    ]);

    expect(result.map((item) => item.id)).toEqual(
      expect.arrayContaining(['square', 'rectangle', 'rhombus', 'parallelogram']),
    );
  });

  it('detects trapezoids', () => {
    const result = classifyQuadrilateral([
      { x: 20, y: 0 },
      { x: 120, y: 0 },
      { x: 100, y: 90 },
      { x: 0, y: 90 },
    ]);

    expect(result.map((item) => item.id)).toContain('trapezoid');
  });

  it('does not classify nearly parallel quadrilaterals as trapezoids when displayed angle sums do not show parallel sides', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 378, y: 20 },
      { x: 291, y: 240 },
      { x: 0, y: 230 },
    ] as const;
    const displayedAngles = getDisplayedAngles([...points]);
    const result = classifyQuadrilateral([...points]);

    expect(displayedAngles[0] + displayedAngles[3]).not.toBe(180);
    expect(displayedAngles[1] + displayedAngles[2]).not.toBe(180);
    expect(result.map((item) => item.id)).not.toContain('trapezoid');
  });

  it('detects parallelograms', () => {
    const result = classifyQuadrilateral([
      { x: 20, y: 0 },
      { x: 140, y: 0 },
      { x: 110, y: 90 },
      { x: -10, y: 90 },
    ]);

    expect(result.map((item) => item.id)).toContain('parallelogram');
  });

  it('detects rhombuses', () => {
    const result = classifyQuadrilateral([
      { x: 50, y: 0 },
      { x: 100, y: 50 },
      { x: 50, y: 100 },
      { x: 0, y: 50 },
    ]);

    expect(result.map((item) => item.id)).toContain('rhombus');
  });

  it('does not classify a general quadrilateral', () => {
    const result = classifyQuadrilateral([
      { x: 0, y: 0 },
      { x: 120, y: 10 },
      { x: 90, y: 95 },
      { x: 15, y: 70 },
    ]);

    expect(result).toEqual([]);
  });

  it('does not classify screenshot-like uneven quadrilaterals as squares or rhombuses', () => {
    const result = classifyQuadrilateral([
      { x: 0, y: 0 },
      { x: 240, y: 0 },
      { x: 240, y: 241 },
      { x: 0, y: 240 },
    ]);

    expect(result.map((item) => item.id)).not.toContain('square');
    expect(result.map((item) => item.id)).not.toContain('rhombus');
  });

  it('shows near-match hints separately for almost squares', () => {
    const result = getQuadrilateralNearMissHints([
      { x: 0, y: 0 },
      { x: 240, y: 0 },
      { x: 240, y: 241 },
      { x: 0, y: 240 },
    ]);

    expect(result.map((item) => item.id)).toContain('near-square');
  });
});
