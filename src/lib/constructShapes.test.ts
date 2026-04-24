import { describe, expect, it } from 'vitest';
import { classifyQuadrilateral, classifyTriangle } from './classify';
import {
  constructEquilateralTriangle,
  constructIsoscelesTriangle,
  constructRectangle,
  constructRhombus,
  constructRightTriangle,
  constructSquare,
} from './constructShapes';

describe('constructShapes', () => {
  it('constructs strict quadrilateral targets', () => {
    const center = { x: 380, y: 260 };

    expect(classifyQuadrilateral(constructSquare(center, 240)).map((item) => item.id)).toContain('square');
    expect(classifyQuadrilateral(constructRectangle(center, 300, 180)).map((item) => item.id)).toContain(
      'rectangle',
    );
    expect(classifyQuadrilateral(constructRhombus(center, 180)).map((item) => item.id)).toContain('rhombus');
  });

  it('constructs strict triangle targets', () => {
    const center = { x: 380, y: 260 };

    expect(classifyTriangle(constructEquilateralTriangle(center, 240)).map((item) => item.id)).toContain(
      'equilateral-triangle',
    );
    expect(classifyTriangle(constructIsoscelesTriangle(center, 260, 220)).map((item) => item.id)).toContain(
      'isosceles-triangle',
    );
    expect(classifyTriangle(constructRightTriangle(center, 220)).map((item) => item.id)).toContain(
      'right-triangle',
    );
  });
});
