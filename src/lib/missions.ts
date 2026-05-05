import type { Mission, ShapeMode } from '../types';

export const MISSIONS: Mission[] = [
  {
    id: 'mission-isosceles-triangle',
    mode: 'triangle',
    title: '이등변삼각형 만들기',
    prompt: '두 변의 길이가 같아지도록 꼭짓점을 움직여 보세요.',
    targetClassificationId: 'isosceles-triangle',
    targetLabel: '이등변삼각형',
    constructionTarget: 'isosceles-triangle',
  },
  {
    id: 'mission-equilateral-triangle',
    mode: 'triangle',
    title: '정삼각형 만들기',
    prompt: '세 변의 길이가 모두 같아지도록 맞춰 보세요.',
    targetClassificationId: 'equilateral-triangle',
    targetLabel: '정삼각형',
    constructionTarget: 'equilateral-triangle',
  },
  {
    id: 'mission-right-triangle',
    mode: 'triangle',
    title: '직각삼각형 만들기',
    prompt: '한 각이 90도가 되도록 꼭짓점을 옮겨 보세요.',
    targetClassificationId: 'right-triangle',
    targetLabel: '직각삼각형',
    constructionTarget: 'right-triangle',
  },
  {
    id: 'mission-square',
    mode: 'quadrilateral',
    title: '정사각형 만들기',
    prompt: '네 변의 길이가 같고 네 각이 90도가 되도록 맞춰 보세요.',
    targetClassificationId: 'square',
    targetLabel: '정사각형',
    constructionTarget: 'square',
  },
  {
    id: 'mission-rectangle',
    mode: 'quadrilateral',
    title: '직사각형 만들기',
    prompt: '네 각을 90도로 맞추고 마주 보는 변의 길이를 같게 해 보세요.',
    targetClassificationId: 'rectangle',
    targetLabel: '직사각형',
    constructionTarget: 'rectangle',
  },
  {
    id: 'mission-trapezoid',
    mode: 'quadrilateral',
    title: '사다리꼴 만들기',
    prompt: '한 쌍의 마주 보는 변이 평행해지도록 만들어 보세요.',
    targetClassificationId: 'trapezoid',
    targetLabel: '사다리꼴',
  },
  {
    id: 'mission-parallelogram',
    mode: 'quadrilateral',
    title: '평행사변형 만들기',
    prompt: '두 쌍의 마주 보는 변이 각각 평행해지도록 맞춰 보세요.',
    targetClassificationId: 'parallelogram',
    targetLabel: '평행사변형',
  },
  {
    id: 'mission-rhombus',
    mode: 'quadrilateral',
    title: '마름모 만들기',
    prompt: '네 변의 길이가 모두 같아지도록 맞춰 보세요.',
    targetClassificationId: 'rhombus',
    targetLabel: '마름모',
    constructionTarget: 'rhombus',
  },
];

export function getMissionsForMode(mode: ShapeMode): Mission[] {
  return MISSIONS.filter((mission) => mission.mode === mode);
}
