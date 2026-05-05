import { describe, expect, it } from 'vitest';
import { getMissionsForMode, MISSIONS } from './missions';

describe('missions', () => {
  it('provides triangle missions with strict classification targets', () => {
    const missions = getMissionsForMode('triangle');

    expect(missions).toHaveLength(3);
    expect(missions.map((mission) => mission.targetClassificationId)).toEqual([
      'isosceles-triangle',
      'equilateral-triangle',
      'right-triangle',
    ]);
  });

  it('provides quadrilateral missions for curriculum shape families', () => {
    const missions = getMissionsForMode('quadrilateral');

    expect(missions.map((mission) => mission.targetClassificationId)).toEqual([
      'square',
      'rectangle',
      'trapezoid',
      'parallelogram',
      'rhombus',
    ]);
  });

  it('uses unique mission ids', () => {
    const ids = MISSIONS.map((mission) => mission.id);

    expect(new Set(ids).size).toBe(ids.length);
  });
});
