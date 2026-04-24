import type { AngleMeasurement, Classification, NearMissHint, ShapeMode, SideMeasurement } from '../types';

type MeasurementPanelProps = {
  mode: ShapeMode;
  sides: SideMeasurement[];
  angles: AngleMeasurement[];
  classifications: Classification[];
  nearMissHints: NearMissHint[];
};

const MODE_LABELS: Record<ShapeMode, string> = {
  triangle: '삼각형',
  quadrilateral: '사각형',
};

export function MeasurementPanel({
  mode,
  sides,
  angles,
  classifications,
  nearMissHints,
}: MeasurementPanelProps) {
  const representative = classifications[0];
  const related = classifications.slice(1);

  return (
    <aside className="measurement-panel" aria-label="실시간 도형 정보">
      <div className="panel-header">
        <p className="eyebrow">지금 탐구 중</p>
        <h2>{MODE_LABELS[mode]}</h2>
      </div>

      <section className="panel-section">
        <h3>변의 길이</h3>
        <div className="measurement-list">
          {sides.map((side) => (
            <div className={side.isEqualHighlight ? 'measurement-row hot' : 'measurement-row'} key={side.id}>
              <span>
                {side.fromLabel}
                {side.toLabel}
              </span>
              <strong>{side.lengthUnits.toFixed(1)} 단위</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="panel-section">
        <h3>각의 크기</h3>
        <div className="measurement-list">
          {angles.map((angle) => (
            <div className={angle.isRight ? 'measurement-row hot' : 'measurement-row'} key={angle.id}>
              <span>각 {angle.label}</span>
              <strong>{angle.displayDegrees}°</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="panel-section">
        <h3>발견한 도형</h3>
        {representative ? (
          <div className="classification-stack">
            <div className="representative-card">
              <span>대표 도형</span>
              <strong>{representative.label}</strong>
            </div>
            {related.length > 0 && (
              <div>
                <p className="related-label">함께 만족하는 성질</p>
                <div className="badge-list">
                  {related.map((classification) => (
                    <span className="shape-badge secondary" key={classification.id}>
                      {classification.label}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="hint">꼭짓점을 움직여서 같은 길이의 변이나 직각을 찾아보세요.</p>
        )}
      </section>

      {nearMissHints.length > 0 && (
        <section className="panel-section">
          <h3>거의 되었어요</h3>
          <div className="near-list">
            {nearMissHints.map((nearMissHint) => (
              <div className="near-card" key={nearMissHint.id}>
                <strong>{nearMissHint.label}</strong>
                <span>{nearMissHint.message}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </aside>
  );
}
