# Shape Classification Precision And Guides Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make shape classification match the values students see on screen, and add gentle construction aids so exact shapes such as squares are achievable without frustrating pixel-perfect dragging.

**Architecture:** Split shape recognition into strict classification and near-match guidance. Strict classification should use display-aligned measurements, while optional guide features such as snap-to-grid, magnetic snapping, and one-click target-shape construction help students reach exact conditions.

**Tech Stack:** React, TypeScript, HTML5 Canvas, Pointer Events, Vitest, React Testing Library, Playwright/browser verification.

---

## Root Cause Summary

Current logic treats sides and angles as "close enough" using hidden raw tolerances:

- Equal side tolerance: `max(6px, 4% of longer side)`.
- Right angle tolerance: `3 degrees`.

That means a displayed quadrilateral with side lengths `24.0, 24.1, 24.0, 24.0` and angles around `90, 90, 89.8, 90.2` is classified as a square, because the raw `1px` side difference is less than the current `9.6px` tolerance and `89.8°` is within the `3°` right-angle tolerance.

This is mathematically defensible as a "near match" rule, but pedagogically confusing because the classification contradicts the visible numbers.

## Product Decision

Use two levels of feedback:

1. **발견한 도형**: strict, celebratory, must match the numbers students see.
2. **거의 되었어요**: near-match hint, no celebration, used when the shape is close but not exact.

For example:

- `24.0, 24.1, 24.0, 24.0` should not show `정사각형`.
- It may show a hint such as `거의 정사각형이에요. 네 변의 길이를 모두 같게 맞춰 보세요.`
- A shape should show `정사각형` only when visible side lengths all match and visible angles are all `90°`.

## Proposed File Structure

- Modify: `src/lib/geometry.ts` - add display-aligned measurement helpers and stricter comparison utilities.
- Modify: `src/lib/classify.ts` - separate strict classifications from near-match hints.
- Modify: `src/types.ts` - add `NearMissHint`, `GuideMode`, and optional construction action types.
- Modify: `src/lib/classify.test.ts` - add regression tests for false positives.
- Modify: `src/lib/geometry.test.ts` - add tests for displayed-value comparisons.
- Modify: `src/App.tsx` - wire guide mode, strict classifications, near-match hints, and construction actions.
- Modify: `src/components/MeasurementPanel.tsx` - show strict discoveries separately from near-match hints.
- Modify: `src/components/Toolbar.tsx` - add guide controls.
- Modify: `src/components/ShapeCanvas.tsx` - apply optional snap/magnetic behavior during drag.
- Modify: `src/App.css` - style guide controls and near-match hints.
- Modify: `src/App.test.tsx` - smoke-test guide controls and strict/near-match labels.

## Classification Rules

### Strict Length Equality

Use the same rounded value shown to students:

```ts
export function toDisplayedLengthUnits(px: number): number {
  return Math.round((px / UNIT_SCALE_PX) * 10) / 10;
}

export function areDisplayedLengthsEqual(aPx: number, bPx: number): boolean {
  return toDisplayedLengthUnits(aPx) === toDisplayedLengthUnits(bPx);
}
```

Result:

- `24.0` and `24.0` count equal.
- `24.0` and `24.1` do not count equal.

### Strict Right Angle

Use the same rounded angle shown to students:

```ts
export function toDisplayedAngleDegrees(degrees: number): number {
  return Math.round(degrees);
}

export function isDisplayedRightAngle(degrees: number): boolean {
  return toDisplayedAngleDegrees(degrees) === 90;
}
```

Result:

- Displayed `90°` counts right.
- Displayed `89°` or `91°` does not count right.

### Near-Match Rules

Keep forgiving tolerances for hints only:

- Near equal side: current tolerance or a slightly reduced tolerance.
- Near right angle: within `3°`.
- Near square: all sides near equal and all angles near right, but strict square is false.

Near-match hints must not trigger celebration.

## Task 1: Add Display-Aligned Geometry Helpers

**Files:**
- Modify: `src/lib/geometry.ts`
- Modify: `src/lib/geometry.test.ts`

- [ ] **Step 1: Write failing tests for displayed equality**

Add tests:

```ts
expect(toDisplayedLengthUnits(240)).toBe(24);
expect(toDisplayedLengthUnits(241)).toBe(24.1);
expect(areDisplayedLengthsEqual(240, 241)).toBe(false);
expect(areDisplayedLengthsEqual(240, 240.4)).toBe(true);
expect(toDisplayedAngleDegrees(89.4)).toBe(89);
expect(isDisplayedRightAngle(89.4)).toBe(false);
expect(isDisplayedRightAngle(89.6)).toBe(true);
```

- [ ] **Step 2: Run the failing tests**

Run:

```bash
npm test -- src/lib/geometry.test.ts
```

Expected: FAIL because helpers do not exist yet.

- [ ] **Step 3: Implement helpers**

Add:

```ts
export function toDisplayedLengthUnits(px: number): number;
export function toDisplayedAngleDegrees(degrees: number): number;
export function areDisplayedLengthsEqual(aPx: number, bPx: number): boolean;
export function isDisplayedRightAngle(degrees: number): boolean;
```

Update `toUnits` to delegate to `toDisplayedLengthUnits` so display and strict logic share one source.

- [ ] **Step 4: Run tests**

Run:

```bash
npm test -- src/lib/geometry.test.ts
```

Expected: PASS.

## Task 2: Prevent False Positive Classifications

**Files:**
- Modify: `src/lib/classify.ts`
- Modify: `src/lib/classify.test.ts`

- [ ] **Step 1: Add regression tests for user-reported bugs**

Add a quadrilateral test matching the screenshot:

```ts
const result = classifyQuadrilateral([
  { x: 0, y: 0 },
  { x: 240, y: 0 },
  { x: 240, y: 241 },
  { x: 0, y: 240 },
]);

expect(result.map((item) => item.id)).not.toContain('square');
expect(result.map((item) => item.id)).not.toContain('rhombus');
```

Add triangle false-positive tests:

```ts
const result = classifyTriangle([
  { x: 0, y: 0 },
  { x: 203, y: 0 },
  { x: 100, y: 175 },
]);

expect(result.map((item) => item.id)).not.toContain('equilateral-triangle');
```

Also add a test where visible side lengths differ enough that no `isosceles-triangle` appears.

- [ ] **Step 2: Run failing tests**

Run:

```bash
npm test -- src/lib/classify.test.ts
```

Expected: FAIL with current tolerance-based logic.

- [ ] **Step 3: Update strict classification logic**

Replace `areLengthsClose` in strict classification with `areDisplayedLengthsEqual`.

Replace `areAnglesClose(angle, 90)` in strict right-angle classification with `isDisplayedRightAngle`.

Keep `areSegmentsParallel` for quadrilateral categories for now, but consider adding a future displayed parallel indicator if teachers need stricter visual consistency.

- [ ] **Step 4: Run tests**

Run:

```bash
npm test -- src/lib/classify.test.ts
```

Expected: PASS.

## Task 3: Add Near-Match Hints Without Celebration

**Files:**
- Modify: `src/types.ts`
- Modify: `src/lib/classify.ts`
- Modify: `src/lib/classify.test.ts`
- Modify: `src/App.tsx`
- Modify: `src/components/MeasurementPanel.tsx`

- [ ] **Step 1: Add hint type**

Add:

```ts
export type NearMissHint = {
  id: string;
  label: string;
  message: string;
};
```

- [ ] **Step 2: Add near-match functions**

Add:

```ts
export function getTriangleNearMissHints(points: [Point, Point, Point]): NearMissHint[];
export function getQuadrilateralNearMissHints(points: [Point, Point, Point, Point]): NearMissHint[];
export function getShapeNearMissHints(mode: ShapeMode, points: Point[]): NearMissHint[];
```

Rules:

- If strict classification already includes the target, do not show its near-match hint.
- If a square is close but not strict, show `거의 정사각형이에요. 네 변의 길이와 네 각을 조금 더 맞춰 보세요.`
- If an equilateral triangle is close but not strict, show `거의 정삼각형이에요. 세 변의 길이를 모두 같게 맞춰 보세요.`
- If an isosceles triangle is close but not strict, show `거의 이등변삼각형이에요. 같은 길이의 두 변을 찾아보세요.`

- [ ] **Step 3: Show hints separately**

In `MeasurementPanel`, keep:

- `발견한 도형` for strict classifications.
- `거의 되었어요` for near-match hints.

Near-match hint color should be amber/blue, not red celebration.

- [ ] **Step 4: Confirm celebration only uses strict classifications**

`App.tsx` should continue to trigger `CelebrationBanner` only from strict `classifications`, not from near-match hints.

## Task 4: Make Exact Squares Easier To Create

**Files:**
- Modify: `src/types.ts`
- Modify: `src/App.tsx`
- Modify: `src/components/Toolbar.tsx`
- Modify: `src/components/ShapeCanvas.tsx`
- Modify: `src/App.css`
- Modify: `src/App.test.tsx`

- [ ] **Step 1: Add guide mode**

Add:

```ts
export type GuideMode = 'free' | 'magnetic';
```

Default to `magnetic` for classroom usability.

Toolbar label:

- `자석 도움 켜짐`
- `자유롭게 움직이기`

- [ ] **Step 2: Add snap-to-grid in magnetic mode**

In `ShapeCanvas`, when dragging and guide mode is `magnetic`, snap the dragged point to a grid unit such as `20px`.

Use:

```ts
function snapPointToGrid(point: Point, gridSize = 20): Point {
  return {
    x: Math.round(point.x / gridSize) * gridSize,
    y: Math.round(point.y / gridSize) * gridSize,
  };
}
```

Then clamp after snapping.

- [ ] **Step 3: Add construction action buttons**

In quadrilateral mode, show:

- `정사각형 맞추기`
- `직사각형 맞추기`
- `마름모 맞추기`

In triangle mode, show:

- `정삼각형 맞추기`
- `이등변삼각형 맞추기`
- `직각삼각형 맞추기`

These are not shortcuts that skip learning; they are reset-like construction aids for teachers and students who want to inspect exact properties.

- [ ] **Step 4: Implement construction helpers**

Create pure helpers in a new file:

- Create: `src/lib/constructShapes.ts`

Functions:

```ts
export function constructSquare(center: Point, sidePx: number): Point[];
export function constructRectangle(center: Point, widthPx: number, heightPx: number): Point[];
export function constructRhombus(center: Point, sidePx: number): Point[];
export function constructEquilateralTriangle(center: Point, sidePx: number): Point[];
export function constructIsoscelesTriangle(center: Point, widthPx: number, heightPx: number): Point[];
export function constructRightTriangle(center: Point, sidePx: number): Point[];
```

Clamp outputs to canvas bounds if needed.

- [ ] **Step 5: Add tests for construction helpers**

Create:

- `src/lib/constructShapes.test.ts`

Assert that `constructSquare` returns a shape classified as `square`, and `constructEquilateralTriangle` returns `equilateral-triangle`.

## Task 5: Improve Classification Presentation

**Files:**
- Modify: `src/components/MeasurementPanel.tsx`
- Modify: `src/App.css`

- [ ] **Step 1: Separate representative shape from related properties**

When exact square is detected, display:

- `대표 도형: 정사각형`
- `함께 만족하는 성질: 직사각형, 마름모, 평행사변형, 사다리꼴`

This reduces the feeling that the app is shouting every possible label at once.

- [ ] **Step 2: Add short explanatory text**

Use concise copy:

```text
정사각형은 네 변의 길이가 같고 네 각이 모두 직각인 사각형이에요.
```

Avoid long instructions or visible implementation explanations.

## Task 6: Browser Verification

**Files:**
- No required source edits unless verification finds issues.

- [ ] **Step 1: Run automated checks**

Run:

```bash
npm test
npm run build
npm run lint
```

Expected: PASS.

- [ ] **Step 2: Reproduce the screenshot-like shape**

Use browser automation to create:

- Side lengths: `24.0, 24.1, 24.0, 24.0`
- Angles: around `90°, 90°, 90°, 90°` with at least one displayed non-90 case if possible.

Expected:

- `정사각형` does not appear unless all visible values match.
- A near-match hint may appear.
- No celebration banner for square.

- [ ] **Step 3: Verify exact construction aids**

Use `정사각형 맞추기`.

Expected:

- Side lengths all display the same.
- Angles all display `90°`.
- `정사각형` appears.
- Celebration banner appears once.

- [ ] **Step 4: Verify triangle false positives**

Create a triangle with visibly different side lengths.

Expected:

- No `정삼각형` if visible side lengths differ.
- No `이등변삼각형` if no visible pair matches.
- Near-match hint is allowed only in the hint section.

- [ ] **Step 5: Verify mobile layout**

Use a mobile viewport.

Expected:

- Guide controls wrap without overlap.
- Canvas remains draggable.
- Measurement and hint sections remain readable.

## Acceptance Criteria

- The screenshot-like `24.0, 24.1, 24.0, 24.0` quadrilateral is no longer classified as `정사각형`.
- A displayed `89°` angle is no longer treated as a strict right angle.
- Strict classifications match the visible measurement values.
- Near misses are shown as hints, not as completed transformations.
- Students can make exact squares with either magnetic snapping or `정사각형 맞추기`.
- Tests cover the reported false positives.
- `npm test`, `npm run build`, and `npm run lint` pass.
