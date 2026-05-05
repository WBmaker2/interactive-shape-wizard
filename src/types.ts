export type ShapeMode = 'triangle' | 'quadrilateral';

export type GuideMode = 'free' | 'magnetic';

export type ConstructionTarget =
  | 'equilateral-triangle'
  | 'isosceles-triangle'
  | 'right-triangle'
  | 'square'
  | 'rectangle'
  | 'rhombus';

export type Point = {
  x: number;
  y: number;
};

export type SideMeasurement = {
  id: string;
  fromLabel: string;
  toLabel: string;
  lengthPx: number;
  lengthUnits: number;
  midpoint: Point;
  isEqualHighlight: boolean;
};

export type AngleMeasurement = {
  id: string;
  label: string;
  degrees: number;
  displayDegrees: number;
  vertex: Point;
  isRight: boolean;
};

export type Classification = {
  id: string;
  label: string;
  message: string;
  priority: number;
};

export type NearMissHint = {
  id: string;
  label: string;
  message: string;
};

export type Mission = {
  id: string;
  mode: ShapeMode;
  title: string;
  prompt: string;
  targetClassificationId: string;
  targetLabel: string;
  constructionTarget?: ConstructionTarget;
};
