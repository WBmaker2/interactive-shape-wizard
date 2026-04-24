# Interactive Shape Wizard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an elementary-school geometry web app where students drag triangle or quadrilateral vertices and see side lengths, angles, and shape classifications update in real time.

**Architecture:** Use a Vite + React + TypeScript app with the math isolated in pure utility modules and the interactive drawing isolated in a canvas component. The UI will keep vertices in React state, redraw the HTML5 Canvas on every state change, and derive measurements/classifications from tested geometry helpers.

**Tech Stack:** Vite, React, TypeScript, HTML5 Canvas, Pointer Events, Vitest, React Testing Library, Playwright/manual browser verification, lucide-react icons.

---

## Current Project Context

- Workspace root: `/Users/kimhongnyeon/Dev/codex/interactive-shape-wizard`
- Current state: empty directory, not a git repository yet.
- Local instruction: use respectful Korean (`존대말`) for user-facing copy and responses.
- Product language: Korean, aimed at grades 3-4 math geometry lessons.

## Proposed File Structure

- Create: `package.json` - npm scripts and dependencies.
- Create: `index.html` - Vite entry HTML.
- Create: `src/main.tsx` - React mount.
- Create: `src/App.tsx` - app-level state, mode switching, layout.
- Create: `src/App.css` - responsive app styling, classroom-friendly theme, reduced-motion handling.
- Create: `src/types.ts` - shared geometry and classification types.
- Create: `src/lib/geometry.ts` - pure geometry helpers for distances, angles, parallel checks, centroid, clamping.
- Create: `src/lib/classify.ts` - pure triangle/quadrilateral classification rules and celebratory messages.
- Create: `src/lib/defaultShapes.ts` - default vertex positions for triangle and quadrilateral modes.
- Create: `src/components/ShapeCanvas.tsx` - canvas rendering and drag/drop pointer interaction.
- Create: `src/components/Toolbar.tsx` - triangle/quadrilateral selector and reset button.
- Create: `src/components/MeasurementPanel.tsx` - side lengths, angles, and detected shape list.
- Create: `src/components/CelebrationBanner.tsx` - fanfare state when a new condition is met.
- Create: `src/test/setup.ts` - testing-library setup.
- Create: `src/lib/geometry.test.ts` - unit tests for math helpers.
- Create: `src/lib/classify.test.ts` - unit tests for shape classification.
- Create: `src/App.test.tsx` - smoke tests for app mode switching and key labels.

## Design Decisions

- Use Canvas for the main drawing surface because the original idea explicitly asks for HTML5 Canvas and vertex dragging.
- Keep math outside React so it can be tested without a browser or canvas.
- Use pointer events instead of separate mouse/touch handlers so mouse, stylus, and finger input share one path.
- Display lengths as classroom-friendly "단위" values, using a scale such as `10px = 1 unit`, rounded to one decimal place.
- Use tolerance-based recognition because students cannot drag pixels perfectly:
  - Equal side tolerance: `max(6px, 4% of longer side)`.
  - Right angle tolerance: `3 degrees`.
  - Parallel side tolerance: `4 degrees`.
- Show all matching classifications instead of forcing a single label. For example, a square can also satisfy rectangle, rhombus, and parallelogram properties.
- Trigger celebration only when a newly matched important classification appears, not on every drag frame.

## Task 1: Initialize the Frontend Project

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/App.css`

- [ ] **Step 1: Initialize git and Vite React TypeScript**

Run:

```bash
git init
npm create vite@latest . -- --template react-ts
```

Expected: Vite creates the React TypeScript app in the current empty directory.

- [ ] **Step 2: Install app and test dependencies**

Run:

```bash
npm install
npm install lucide-react
npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

Expected: dependencies install successfully and `package-lock.json` is created.

- [ ] **Step 3: Add test scripts**

Modify `package.json` scripts:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- [ ] **Step 4: Run baseline checks**

Run:

```bash
npm test
npm run build
```

Expected: tests may report "No test files found" before tests exist; build should pass after scaffold cleanup.

- [ ] **Step 5: Commit**

Run:

```bash
git add .
git commit -m "chore: scaffold interactive shape wizard"
```

## Task 2: Add Geometry Domain Types and Math Helpers

**Files:**
- Create: `src/types.ts`
- Create: `src/lib/geometry.ts`
- Create: `src/lib/geometry.test.ts`

- [ ] **Step 1: Define shared types**

Add to `src/types.ts`:

```ts
export type ShapeMode = 'triangle' | 'quadrilateral';

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
};

export type AngleMeasurement = {
  id: string;
  label: string;
  degrees: number;
  vertex: Point;
};

export type Classification = {
  id: string;
  label: string;
  message: string;
  priority: number;
};
```

- [ ] **Step 2: Write failing geometry tests**

Add tests for distance, midpoint, angle at a vertex, parallel detection, and unit conversion.

Run:

```bash
npm test -- src/lib/geometry.test.ts
```

Expected: FAIL because `src/lib/geometry.ts` does not exist yet.

- [ ] **Step 3: Implement pure geometry helpers**

Add functions:

```ts
export const UNIT_SCALE_PX = 10;

export function distance(a: Point, b: Point): number;
export function toUnits(px: number): number;
export function midpoint(a: Point, b: Point): Point;
export function angleAt(previous: Point, vertex: Point, next: Point): number;
export function angleBetweenSegments(a1: Point, a2: Point, b1: Point, b2: Point): number;
export function areLengthsClose(a: number, b: number): boolean;
export function areAnglesClose(a: number, b: number, tolerance?: number): boolean;
export function areSegmentsParallel(a1: Point, a2: Point, b1: Point, b2: Point): boolean;
export function clampPointToRect(point: Point, width: number, height: number, padding: number): Point;
```

- [ ] **Step 4: Run tests**

Run:

```bash
npm test -- src/lib/geometry.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

Run:

```bash
git add src/types.ts src/lib/geometry.ts src/lib/geometry.test.ts
git commit -m "feat: add geometry math helpers"
```

## Task 3: Add Shape Classification Rules

**Files:**
- Create: `src/lib/classify.ts`
- Create: `src/lib/classify.test.ts`

- [ ] **Step 1: Write failing triangle classification tests**

Cover:
- Equilateral triangle: all sides close.
- Isosceles triangle: any two sides close.
- Right triangle: any angle close to 90 degrees.
- General triangle: no classification.

Run:

```bash
npm test -- src/lib/classify.test.ts
```

Expected: FAIL because classifier does not exist.

- [ ] **Step 2: Implement triangle classification**

Add:

```ts
export function classifyTriangle(points: [Point, Point, Point]): Classification[];
```

Messages:
- `앗! 정삼각형으로 변신 완료!`
- `앗! 이등변삼각형으로 변신 완료!`
- `앗! 직각삼각형으로 변신 완료!`

- [ ] **Step 3: Write failing quadrilateral classification tests**

Cover:
- Rectangle: four right angles.
- Square: four equal sides and four right angles.
- Trapezoid: at least one pair of opposite sides parallel.
- Parallelogram: both pairs of opposite sides parallel.
- Rhombus: four equal sides.
- General quadrilateral: no classification.

Run:

```bash
npm test -- src/lib/classify.test.ts
```

Expected: FAIL for quadrilateral cases.

- [ ] **Step 4: Implement quadrilateral classification**

Add:

```ts
export function classifyQuadrilateral(points: [Point, Point, Point, Point]): Classification[];
export function classifyShape(mode: ShapeMode, points: Point[]): Classification[];
```

Messages:
- `앗! 직사각형으로 변신 완료!`
- `앗! 정사각형으로 변신 완료!`
- `앗! 사다리꼴로 변신 완료!`
- `앗! 평행사변형으로 변신 완료!`
- `앗! 마름모로 변신 완료!`

- [ ] **Step 5: Run tests**

Run:

```bash
npm test -- src/lib/classify.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit**

Run:

```bash
git add src/lib/classify.ts src/lib/classify.test.ts
git commit -m "feat: classify triangle and quadrilateral shapes"
```

## Task 4: Add Default Shapes and Measurement Derivation

**Files:**
- Create: `src/lib/defaultShapes.ts`
- Modify: `src/lib/geometry.ts`
- Modify: `src/lib/geometry.test.ts`

- [ ] **Step 1: Add default vertices**

Create:

```ts
export function createDefaultTriangle(width: number, height: number): Point[];
export function createDefaultQuadrilateral(width: number, height: number): Point[];
```

Use centered, non-special shapes so students can discover transformations through dragging.

- [ ] **Step 2: Add measurement helpers**

Add:

```ts
export function getSideMeasurements(points: Point[]): SideMeasurement[];
export function getAngleMeasurements(points: Point[]): AngleMeasurement[];
```

- [ ] **Step 3: Add tests**

Run:

```bash
npm test -- src/lib/geometry.test.ts
```

Expected: PASS with side count and angle count assertions for 3-point and 4-point shapes.

- [ ] **Step 4: Commit**

Run:

```bash
git add src/lib/defaultShapes.ts src/lib/geometry.ts src/lib/geometry.test.ts
git commit -m "feat: derive shape measurements"
```

## Task 5: Build the Interactive Canvas

**Files:**
- Create: `src/components/ShapeCanvas.tsx`
- Modify: `src/App.tsx`
- Modify: `src/App.css`

- [ ] **Step 1: Create the canvas component API**

Use props:

```ts
type ShapeCanvasProps = {
  mode: ShapeMode;
  points: Point[];
  sideMeasurements: SideMeasurement[];
  angleMeasurements: AngleMeasurement[];
  activeClassificationIds: string[];
  onChangePoints: (points: Point[]) => void;
};
```

- [ ] **Step 2: Implement responsive canvas sizing**

Use `ResizeObserver` to track canvas CSS size, scale for `devicePixelRatio`, and redraw on size or point changes.

- [ ] **Step 3: Implement pointer dragging**

Behavior:
- Pointer down near a vertex selects it.
- Pointer move updates that vertex.
- Pointer up/cancel releases it.
- Points are clamped inside the canvas with padding.
- Touch dragging calls `setPointerCapture`.

- [ ] **Step 4: Draw the shape and labels**

Canvas should render:
- Filled polygon.
- Distinct outline.
- Draggable vertex handles.
- Korean vertex labels `A`, `B`, `C`, `D`.
- Side length labels near each side.
- Angle labels near each vertex.
- Small right-angle marker when an angle is close to 90 degrees.
- Highlighted equal-length sides when classification includes isosceles, equilateral, square, or rhombus.

- [ ] **Step 5: Smoke test manually**

Run:

```bash
npm run dev
```

Expected: local app opens with a draggable triangle and stable measurements.

- [ ] **Step 6: Commit**

Run:

```bash
git add src/components/ShapeCanvas.tsx src/App.tsx src/App.css
git commit -m "feat: add draggable shape canvas"
```

## Task 6: Build Controls, Measurement Panel, and Celebration Feedback

**Files:**
- Create: `src/components/Toolbar.tsx`
- Create: `src/components/MeasurementPanel.tsx`
- Create: `src/components/CelebrationBanner.tsx`
- Modify: `src/App.tsx`
- Modify: `src/App.css`

- [ ] **Step 1: Add toolbar**

Controls:
- Triangle button.
- Quadrilateral button.
- Reset button.
- Use lucide icons where they fit, with text labels for young learners.

- [ ] **Step 2: Add measurement panel**

Panel content:
- Current mode name.
- Side lengths table.
- Angle list.
- Detected shape badges.
- A gentle hint when no special shape is detected: `꼭짓점을 움직여서 같은 길이의 변이나 직각을 찾아보세요.`

- [ ] **Step 3: Add celebration banner**

Behavior:
- Compare previous classification IDs with current IDs.
- When a new classification appears, show the highest-priority message.
- Animate briefly with accessible reduced-motion fallback.
- Use red emphasis for matched condition text, as requested.

- [ ] **Step 4: Add app-level wiring**

`App.tsx` owns:
- `mode`
- `points`
- derived `sideMeasurements`
- derived `angleMeasurements`
- derived `classifications`
- latest celebration message

- [ ] **Step 5: Add smoke tests**

Create `src/App.test.tsx` with:
- App renders title.
- Triangle and quadrilateral buttons exist.
- Switching mode updates visible measurement labels.

Run:

```bash
npm test
```

Expected: PASS.

- [ ] **Step 6: Commit**

Run:

```bash
git add src/components/Toolbar.tsx src/components/MeasurementPanel.tsx src/components/CelebrationBanner.tsx src/App.tsx src/App.css src/App.test.tsx
git commit -m "feat: add shape controls and feedback"
```

## Task 7: Classroom-Friendly Visual Design and Accessibility

**Files:**
- Modify: `src/App.css`
- Modify: `src/components/ShapeCanvas.tsx`
- Modify: `src/components/Toolbar.tsx`
- Modify: `src/components/MeasurementPanel.tsx`

- [ ] **Step 1: Apply visual direction**

Design goals:
- Wide drawing area as the first visual focus.
- Bright but restrained palette: white workspace, deep ink text, warm yellow celebration, red condition emphasis, blue/green shape accents.
- Rounded but not toy-like controls.
- Large touch targets for tablets.
- No in-app instructional essay; UI labels should be self-explanatory.

- [ ] **Step 2: Add accessibility affordances**

Include:
- Keyboard focus states for buttons.
- `aria-live="polite"` on celebration banner.
- Text alternatives around the canvas explaining current shape state.
- Respect `prefers-reduced-motion`.

- [ ] **Step 3: Add responsive layout**

Desktop:
- Canvas on the left, measurements on the right.

Mobile/tablet:
- Toolbar top, canvas full width, measurements below.

- [ ] **Step 4: Run build and tests**

Run:

```bash
npm test
npm run build
```

Expected: PASS.

- [ ] **Step 5: Commit**

Run:

```bash
git add src/App.css src/components
git commit -m "style: polish classroom geometry interface"
```

## Task 8: Browser Verification

**Files:**
- No required source edits unless verification finds issues.

- [ ] **Step 1: Start local dev server**

Run:

```bash
npm run dev
```

Expected: Vite serves the app, likely at `http://localhost:5173`.

- [ ] **Step 2: Verify desktop workflow**

In browser:
- Load app.
- Drag triangle vertices.
- Confirm side lengths and angles update continuously.
- Create an approximate isosceles triangle and confirm the red-highlighted classification/bannner.
- Switch to quadrilateral.
- Drag into a rectangle/parallelogram-like shape and confirm classification updates.

- [ ] **Step 3: Verify mobile/touch-sized layout**

Use a mobile viewport:
- Confirm controls do not overlap.
- Confirm canvas remains usable.
- Confirm measurement panel text wraps cleanly.

- [ ] **Step 4: Fix any visual or interaction issues**

Run after fixes:

```bash
npm test
npm run build
```

Expected: PASS.

- [ ] **Step 5: Commit**

Run:

```bash
git add .
git commit -m "test: verify interactive shape wizard workflow"
```

## Acceptance Criteria

- Students can switch between triangle and quadrilateral modes.
- Students can drag every vertex with mouse or touch.
- Side lengths and angles update immediately while dragging.
- Triangle classifications include 이등변삼각형, 정삼각형, and 직각삼각형.
- Quadrilateral classifications include 직사각형, 정사각형, 사다리꼴, 평행사변형, and 마름모.
- New classifications trigger a short celebratory Korean message.
- Matching conditions are visibly emphasized in red.
- Canvas and panels are usable on desktop and tablet/mobile widths.
- Math helpers and classification rules have unit tests.
- Final `npm test` and `npm run build` pass.

## Nice-to-Have Follow-Ups

- Teacher mode for adjusting tolerance.
- Challenge cards such as `정삼각형을 만들어 보세요`.
- Snapshot button for students to save their discovered shape.
- Voice/sound fanfare toggle, off by default for classroom control.
- Grid/snap option for easier shape discovery.
