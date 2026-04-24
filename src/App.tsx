import { useMemo, useState } from 'react';
import './App.css';
import { CelebrationBanner } from './components/CelebrationBanner';
import { ShapeCanvas } from './components/ShapeCanvas';
import { MeasurementPanel } from './components/MeasurementPanel';
import { Toolbar } from './components/Toolbar';
import { CANVAS_STAGE } from './lib/canvasStage';
import { classifyShape, getShapeNearMissHints } from './lib/classify';
import {
  constructEquilateralTriangle,
  constructIsoscelesTriangle,
  constructRectangle,
  constructRhombus,
  constructRightTriangle,
  constructSquare,
} from './lib/constructShapes';
import { createDefaultQuadrilateral, createDefaultTriangle } from './lib/defaultShapes';
import { getAngleMeasurements, getEqualSideIndexes, getSideMeasurements } from './lib/geometry';
import type { ConstructionTarget, GuideMode, Point, ShapeMode } from './types';

function createDefaultShape(mode: ShapeMode): Point[] {
  if (mode === 'triangle') {
    return createDefaultTriangle(CANVAS_STAGE.width, CANVAS_STAGE.height);
  }

  return createDefaultQuadrilateral(CANVAS_STAGE.width, CANVAS_STAGE.height);
}

export default function App() {
  const [mode, setMode] = useState<ShapeMode>('triangle');
  const [points, setPoints] = useState<Point[]>(() => createDefaultShape('triangle'));
  const [guideMode, setGuideMode] = useState<GuideMode>('magnetic');

  const classifications = useMemo(() => classifyShape(mode, points), [mode, points]);
  const celebrationMessage = classifications[0]?.message ?? null;
  const nearMissHints = useMemo(() => getShapeNearMissHints(mode, points), [mode, points]);
  const equalSideIndexes = useMemo(() => getEqualSideIndexes(points), [points]);
  const sideMeasurements = useMemo(
    () => getSideMeasurements(points, equalSideIndexes),
    [equalSideIndexes, points],
  );
  const angleMeasurements = useMemo(() => getAngleMeasurements(points), [points]);

  function handleModeChange(nextMode: ShapeMode) {
    setMode(nextMode);
    setPoints(createDefaultShape(nextMode));
  }

  function handleReset() {
    setPoints(createDefaultShape(mode));
  }

  function handleToggleGuideMode() {
    setGuideMode((current) => (current === 'magnetic' ? 'free' : 'magnetic'));
  }

  function handleConstruct(target: ConstructionTarget) {
    const center = { x: CANVAS_STAGE.width / 2, y: CANVAS_STAGE.height / 2 };
    let nextMode: ShapeMode = mode;
    let nextPoints: Point[];

    switch (target) {
      case 'equilateral-triangle':
        nextMode = 'triangle';
        nextPoints = constructEquilateralTriangle(center, 240);
        break;
      case 'isosceles-triangle':
        nextMode = 'triangle';
        nextPoints = constructIsoscelesTriangle(center, 280, 224);
        break;
      case 'right-triangle':
        nextMode = 'triangle';
        nextPoints = constructRightTriangle(center, 230);
        break;
      case 'square':
        nextMode = 'quadrilateral';
        nextPoints = constructSquare(center, 240);
        break;
      case 'rectangle':
        nextMode = 'quadrilateral';
        nextPoints = constructRectangle(center, 320, 200);
        break;
      case 'rhombus':
        nextMode = 'quadrilateral';
        nextPoints = constructRhombus(center, 220);
        break;
    }

    setMode(nextMode);
    setPoints(nextPoints);
  }

  return (
    <main className="app-shell">
      <section className="workspace" aria-labelledby="app-title">
        <header className="app-header">
          <div>
            <p className="subject-label">3-4학년군 수학 · 도형</p>
            <h1 id="app-title">요리조리 도형 변신 마법사</h1>
          </div>
          <Toolbar
            guideMode={guideMode}
            mode={mode}
            onChangeMode={handleModeChange}
            onConstruct={handleConstruct}
            onReset={handleReset}
            onToggleGuideMode={handleToggleGuideMode}
          />
        </header>

        <CelebrationBanner message={celebrationMessage} />

        <div className="main-grid">
          <ShapeCanvas
            activeClassificationIds={classifications.map((classification) => classification.id)}
            angleMeasurements={angleMeasurements}
            guideMode={guideMode}
            mode={mode}
            onChangePoints={setPoints}
            points={points}
            sideMeasurements={sideMeasurements}
          />
          <MeasurementPanel
            angles={angleMeasurements}
            classifications={classifications}
            mode={mode}
            nearMissHints={nearMissHints}
            sides={sideMeasurements}
          />
        </div>
      </section>
    </main>
  );
}
