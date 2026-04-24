import { Magnet, RotateCcw, Shapes, Triangle } from 'lucide-react';
import type { ConstructionTarget, GuideMode, ShapeMode } from '../types';

type ToolbarProps = {
  guideMode: GuideMode;
  mode: ShapeMode;
  onChangeMode: (mode: ShapeMode) => void;
  onConstruct: (target: ConstructionTarget) => void;
  onReset: () => void;
  onToggleGuideMode: () => void;
};

const CONSTRUCTION_LABELS: Record<ConstructionTarget, string> = {
  'equilateral-triangle': '정삼각형 맞추기',
  'isosceles-triangle': '이등변 맞추기',
  'right-triangle': '직각 맞추기',
  square: '정사각형 맞추기',
  rectangle: '직사각형 맞추기',
  rhombus: '마름모 맞추기',
};

export function Toolbar({
  guideMode,
  mode,
  onChangeMode,
  onConstruct,
  onReset,
  onToggleGuideMode,
}: ToolbarProps) {
  const targets: ConstructionTarget[] =
    mode === 'triangle'
      ? ['equilateral-triangle', 'isosceles-triangle', 'right-triangle']
      : ['square', 'rectangle', 'rhombus'];

  return (
    <div className="toolbar" aria-label="도형 선택 도구">
      <div className="mode-group" role="group" aria-label="도형 종류">
        <button
          className={mode === 'triangle' ? 'tool-button active' : 'tool-button'}
          type="button"
          aria-pressed={mode === 'triangle'}
          onClick={() => onChangeMode('triangle')}
        >
          <Triangle size={18} aria-hidden="true" />
          삼각형
        </button>
        <button
          className={mode === 'quadrilateral' ? 'tool-button active' : 'tool-button'}
          type="button"
          aria-pressed={mode === 'quadrilateral'}
          onClick={() => onChangeMode('quadrilateral')}
        >
          <Shapes size={18} aria-hidden="true" />
          사각형
        </button>
      </div>
      <button className="tool-button reset" type="button" onClick={onReset}>
        <RotateCcw size={18} aria-hidden="true" />
        처음 모양
      </button>
      <button
        className={guideMode === 'magnetic' ? 'tool-button guide active' : 'tool-button guide'}
        type="button"
        aria-pressed={guideMode === 'magnetic'}
        onClick={onToggleGuideMode}
      >
        <Magnet size={18} aria-hidden="true" />
        {guideMode === 'magnetic' ? '자석 도움 켜짐' : '자유 이동'}
      </button>
      <div className="construction-group" role="group" aria-label="정확한 도형 맞추기">
        {targets.map((target) => (
          <button className="construct-button" key={target} type="button" onClick={() => onConstruct(target)}>
            {CONSTRUCTION_LABELS[target]}
          </button>
        ))}
      </div>
    </div>
  );
}
