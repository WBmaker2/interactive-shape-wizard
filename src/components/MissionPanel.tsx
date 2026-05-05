import { CheckCircle2, Target, WandSparkles } from 'lucide-react';
import type { ConstructionTarget, Mission } from '../types';

type MissionPanelProps = {
  activeMission: Mission;
  isComplete: boolean;
  missions: Mission[];
  onSelectMission: (missionId: string) => void;
  onUseConstruction: (target: ConstructionTarget) => void;
};

export function MissionPanel({
  activeMission,
  isComplete,
  missions,
  onSelectMission,
  onUseConstruction,
}: MissionPanelProps) {
  return (
    <section className="mission-panel" aria-labelledby="mission-title">
      <div className="mission-heading">
        <div>
          <p className="eyebrow">오늘의 미션</p>
          <h2 id="mission-title">{activeMission.title}</h2>
        </div>
        <div className={isComplete ? 'mission-status complete' : 'mission-status'}>
          {isComplete ? <CheckCircle2 size={18} aria-hidden="true" /> : <Target size={18} aria-hidden="true" />}
          {isComplete ? '완료' : activeMission.targetLabel}
        </div>
      </div>

      <p className="mission-prompt">{activeMission.prompt}</p>

      <div className="mission-actions">
        <div className="mission-tabs" role="group" aria-label="미션 선택">
          {missions.map((mission) => (
            <button
              className={mission.id === activeMission.id ? 'mission-tab active' : 'mission-tab'}
              key={mission.id}
              type="button"
              aria-pressed={mission.id === activeMission.id}
              onClick={() => onSelectMission(mission.id)}
            >
              {mission.targetLabel}
            </button>
          ))}
        </div>

        {activeMission.constructionTarget && (
          <button
            className="mission-helper"
            type="button"
            onClick={() => onUseConstruction(activeMission.constructionTarget as ConstructionTarget)}
          >
            <WandSparkles size={18} aria-hidden="true" />
            미션 도움으로 맞추기
          </button>
        )}
      </div>
    </section>
  );
}
