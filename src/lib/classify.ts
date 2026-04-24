import type { Classification, NearMissHint, Point, ShapeMode } from '../types';
import {
  RIGHT_ANGLE_DEGREES,
  areDisplayedLengthsEqual,
  areAnglesClose,
  areLengthsClose,
  getAngles,
  getDisplayedAngles,
  getSideLengths,
} from './geometry';

const TRIANGLE_MESSAGES = {
  equilateral: '앗! 정삼각형으로 변신 완료!',
  isosceles: '앗! 이등변삼각형으로 변신 완료!',
  right: '앗! 직각삼각형으로 변신 완료!',
};

const QUADRILATERAL_MESSAGES = {
  rectangle: '앗! 직사각형으로 변신 완료!',
  square: '앗! 정사각형으로 변신 완료!',
  trapezoid: '앗! 사다리꼴로 변신 완료!',
  parallelogram: '앗! 평행사변형으로 변신 완료!',
  rhombus: '앗! 마름모로 변신 완료!',
};

function classification(
  id: string,
  label: string,
  message: string,
  priority: number,
): Classification {
  return { id, label, message, priority };
}

function hint(id: string, label: string, message: string): NearMissHint {
  return { id, label, message };
}

function getDisplayedParallelSidePairs(angles: number[]) {
  const [angleA, angleB, angleC, angleD] = angles;

  return {
    abParallelCd: angleA + angleD === 180 && angleB + angleC === 180,
    bcParallelDa: angleA + angleB === 180 && angleC + angleD === 180,
  };
}

export function classifyTriangle(points: [Point, Point, Point]): Classification[] {
  const lengths = getSideLengths(points);
  const angles = getDisplayedAngles(points);
  const [ab, bc, ca] = lengths;
  const allSidesEqual = areDisplayedLengthsEqual(ab, bc) && areDisplayedLengthsEqual(bc, ca);
  const anyTwoSidesEqual =
    areDisplayedLengthsEqual(ab, bc) ||
    areDisplayedLengthsEqual(bc, ca) ||
    areDisplayedLengthsEqual(ca, ab);
  const hasRightAngle = angles.some((angle) => angle === RIGHT_ANGLE_DEGREES);
  const result: Classification[] = [];

  if (allSidesEqual) {
    result.push(classification('equilateral-triangle', '정삼각형', TRIANGLE_MESSAGES.equilateral, 30));
  }

  if (anyTwoSidesEqual) {
    result.push(classification('isosceles-triangle', '이등변삼각형', TRIANGLE_MESSAGES.isosceles, 20));
  }

  if (hasRightAngle) {
    result.push(classification('right-triangle', '직각삼각형', TRIANGLE_MESSAGES.right, 10));
  }

  return result;
}

export function getTriangleNearMissHints(points: [Point, Point, Point]): NearMissHint[] {
  const strictIds = new Set(classifyTriangle(points).map((item) => item.id));
  const lengths = getSideLengths(points);
  const angles = getAngles(points);
  const [ab, bc, ca] = lengths;
  const allSidesNear = areLengthsClose(ab, bc) && areLengthsClose(bc, ca);
  const anyTwoSidesNear = areLengthsClose(ab, bc) || areLengthsClose(bc, ca) || areLengthsClose(ca, ab);
  const anyRightAngleNear = angles.some((angle) => areAnglesClose(angle, RIGHT_ANGLE_DEGREES));
  const result: NearMissHint[] = [];

  if (allSidesNear && !strictIds.has('equilateral-triangle')) {
    result.push(
      hint('near-equilateral-triangle', '거의 정삼각형', '세 변의 길이를 모두 같게 맞춰 보세요.'),
    );
  }

  if (anyTwoSidesNear && !strictIds.has('isosceles-triangle')) {
    result.push(
      hint('near-isosceles-triangle', '거의 이등변삼각형', '같은 길이의 두 변을 찾아보세요.'),
    );
  }

  if (anyRightAngleNear && !strictIds.has('right-triangle')) {
    result.push(hint('near-right-triangle', '거의 직각삼각형', '한 각을 90°로 맞춰 보세요.'));
  }

  return result;
}

export function classifyQuadrilateral(points: [Point, Point, Point, Point]): Classification[] {
  const lengths = getSideLengths(points);
  const angles = getDisplayedAngles(points);
  const [ab, bc, cd, da] = lengths;
  const allSidesEqual = lengths.every((length) => areDisplayedLengthsEqual(length, lengths[0]));
  const oppositeSidesEqual = areDisplayedLengthsEqual(ab, cd) && areDisplayedLengthsEqual(bc, da);
  const allRightAngles = angles.every((angle) => angle === RIGHT_ANGLE_DEGREES);
  const { abParallelCd, bcParallelDa } = getDisplayedParallelSidePairs(angles);
  const bothPairsParallel = abParallelCd && bcParallelDa && oppositeSidesEqual;
  const atLeastOnePairParallel = abParallelCd || bcParallelDa;
  const result: Classification[] = [];

  if (allRightAngles && !oppositeSidesEqual) {
    return result;
  }

  if (allRightAngles && oppositeSidesEqual) {
    result.push(classification('rectangle', '직사각형', QUADRILATERAL_MESSAGES.rectangle, 30));
  }

  if (allSidesEqual && allRightAngles) {
    result.push(classification('square', '정사각형', QUADRILATERAL_MESSAGES.square, 50));
  }

  if (atLeastOnePairParallel) {
    result.push(classification('trapezoid', '사다리꼴', QUADRILATERAL_MESSAGES.trapezoid, 10));
  }

  if (bothPairsParallel) {
    result.push(
      classification('parallelogram', '평행사변형', QUADRILATERAL_MESSAGES.parallelogram, 20),
    );
  }

  if (allSidesEqual) {
    result.push(classification('rhombus', '마름모', QUADRILATERAL_MESSAGES.rhombus, 40));
  }

  return result.sort((aClassification, bClassification) => bClassification.priority - aClassification.priority);
}

export function getQuadrilateralNearMissHints(points: [Point, Point, Point, Point]): NearMissHint[] {
  const strictIds = new Set(classifyQuadrilateral(points).map((item) => item.id));
  const lengths = getSideLengths(points);
  const angles = getAngles(points);
  const [ab, bc, cd, da] = lengths;
  const allSidesNear = lengths.every((length) => areLengthsClose(length, lengths[0]));
  const oppositeSidesNear = areLengthsClose(ab, cd) && areLengthsClose(bc, da);
  const allRightAnglesNear = angles.every((angle) => areAnglesClose(angle, RIGHT_ANGLE_DEGREES));
  const result: NearMissHint[] = [];

  if (allSidesNear && allRightAnglesNear && !strictIds.has('square')) {
    result.push(
      hint('near-square', '거의 정사각형', '네 변의 길이와 네 각을 조금 더 맞춰 보세요.'),
    );
  }

  if (allSidesNear && !strictIds.has('rhombus')) {
    result.push(hint('near-rhombus', '거의 마름모', '네 변의 길이를 모두 같게 맞춰 보세요.'));
  }

  if (allRightAnglesNear && oppositeSidesNear && !strictIds.has('rectangle')) {
    result.push(
      hint('near-rectangle', '거의 직사각형', '네 각과 마주 보는 변의 길이를 정확히 맞춰 보세요.'),
    );
  }

  return result;
}

export function classifyShape(mode: ShapeMode, points: Point[]): Classification[] {
  if (mode === 'triangle' && points.length === 3) {
    return classifyTriangle(points as [Point, Point, Point]);
  }

  if (mode === 'quadrilateral' && points.length === 4) {
    return classifyQuadrilateral(points as [Point, Point, Point, Point]);
  }

  return [];
}

export function getShapeNearMissHints(mode: ShapeMode, points: Point[]): NearMissHint[] {
  if (mode === 'triangle' && points.length === 3) {
    return getTriangleNearMissHints(points as [Point, Point, Point]);
  }

  if (mode === 'quadrilateral' && points.length === 4) {
    return getQuadrilateralNearMissHints(points as [Point, Point, Point, Point]);
  }

  return [];
}
