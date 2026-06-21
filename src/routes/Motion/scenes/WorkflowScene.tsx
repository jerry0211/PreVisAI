import { CameraStage } from '../CameraStage';
import type { Shot, SeedMap, SceneProps } from '../pieces';

/* =============================================================================
   SCENE 1 — WORKFLOW WALKTHROUGH
   -----------------------------------------------------------------------------
   Films the real /workflow route (storyboard already uploaded) and the camera
   glides shot-to-shot, ending on a cursor click of the "스토리보드 분석" CTA.
   A "filmed-route" scene: it just wraps CameraStage and feeds it the clock `t`.
   Tune the camera in SHOTS below; see CameraStage / pieces.ts (Shot) for knobs.
   ========================================================================== */

/* CSS px width the page is laid out at (the iframe viewport). */
const WORLD_WIDTH = 1440;

/* Pre-uploaded Parasite storyboard (public asset, URL-encoded). */
const PARASITE_STORYBOARD =
  '/outputs/Storyboard%20Splits/%EC%8A%A4%ED%86%A0%EB%A6%AC%EB%B3%B4%EB%93%9C.jpg';

/* Storage seeded so /workflow renders populated (active project + storyboard). */
const SEED: SeedMap = {
  session: {
    projectName: 'Parasite',
    demoStoryboard: PARASITE_STORYBOARD,
  },
  local: {
    projects: JSON.stringify([
      'Parasite',
      'Orbital Witness',
      'Glass Desert',
      'Signal Room',
    ]),
  },
};

/* ---- SHOT LIST ------------------------------------------------------------
   Played top-to-bottom. Tune each shot's `move` (glide-in), `hold` (still) and
   `pad` (zoom tightness). Scene length = sum of every move+hold. */
const SHOTS: Shot[] = [
  {
    // Intro: the workflow title.
    target: 'h1',
    move: 600,
    hold: 1000,
    pad: 28,
    kicker: 'PreVisAI · Studio',
    caption: '스토리보드를 영상 프롬프트로',
  },
  {
    // The uploaded storyboard card.
    target: 'section[aria-label="storyboard and scenario"] article:nth-of-type(1)',
    move: 600,
    hold: 1200,
    pad: 16,
    kicker: '01 · Storyboard',
    caption: '스토리보드 업로드',
  },
  {
    // The "run pipeline" section.
    target: 'section[aria-label="storyboard actions"]',
    move: 700,
    hold: 0,
    pad: 18,
    kicker: '02 · Pipeline',
    caption: '원클릭 파이프라인 실행',
  },
  {
    // Tight on the analyze CTA button — cursor glides in and clicks it.
    target: 'section[aria-label="storyboard actions"] button',
    move: 800,
    hold: 2200,
    pad: 12,
    kicker: '02 · Pipeline',
    caption: '원클릭 파이프라인 실행',
    cursorClick: {
      size: 70,
      startAt: 420,
      from: { x: 0.68, y: 0.95 },
      move: 800,
      clickAt: 1230,
      ripple: 480,
      rippleSize: 150,
    },
  },
];

export const WORKFLOW_SCENE_DURATION = SHOTS.reduce(
  (sum, s) => sum + s.move + s.hold,
  0
);

export function WorkflowScene({ t }: SceneProps) {
  return (
    <CameraStage
      src="/workflow"
      worldWidth={WORLD_WIDTH}
      shots={SHOTS}
      seed={SEED}
      t={t}
    />
  );
}
