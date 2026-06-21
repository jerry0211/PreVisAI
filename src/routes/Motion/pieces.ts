/* =============================================================================
   MOTION PIECES — registry of advertising motion graphics.
   -----------------------------------------------------------------------------
   A piece is an ordered list of SCENES played as one flow (see SceneSequence).
   Each scene is a clock-driven component of a fixed duration. Two flavours of
   scene exist, but the piece treats them uniformly:
     • Filmed-route scene — wraps CameraStage to film a real route with a moving
       camera (e.g. WorkflowScene). Camera knobs: Shot / CursorClick below.
     • Bespoke scene      — a hand-built composite (e.g. AssetExtractScene).
   Add a scene to a piece's `scenes` array; build the whole demo by listing every
   scene in order. All Motion-tab files live under this folder.

   Selectors in filmed scenes target semantic / aria hooks (NOT CSS-module class
   names, which are hashed at build time and unstable).
   ========================================================================== */

import type { ComponentType } from 'react';
import { WorkflowScene, WORKFLOW_SCENE_DURATION } from './scenes/WorkflowScene';
import {
  AssetExtractScene,
  ASSET_EXTRACT_DURATION,
} from './scenes/AssetExtractScene';
import {
  PromptExtractScene,
  PROMPT_EXTRACT_DURATION,
} from './scenes/PromptExtractScene';
import {
  TransitionToPromptScene,
  TRANSITION_DURATION,
} from './scenes/TransitionToPromptScene';
import {
  PromptScrollScene,
  PROMPT_SCROLL_DURATION,
} from './scenes/PromptScrollScene';

/* -----------------------------------------------------------------------------
   CURSOR CLICK — animation config for a filmed shot's click cursor. Adding this
   object to a shot turns the cursor ON (the shot should tightly frame the
   button/CTA, which `aspectFit` centres — the cursor always clicks the centre).
   Every field is optional; omitted fields fall back to CameraStage's
   CURSOR_DEFAULTS. Timeline within the shot's hold:
     hold start → (startAt) → cursor appears → (move) glides → (clickAt) clicks
   `move`/`clickAt`/`ripple` are measured from the cursor's appearance, so the
   whole thing must fit: startAt + clickAt + ripple ≤ the shot's `hold`.
   --------------------------------------------------------------------------- */
export interface CursorClick {
  /** Arrow size in frame px (logical). Bigger = larger cursor. Default 44. */
  size?: number;
  /** Delay (ms) after the camera settles on this shot (its hold start) before
   *  the cursor appears. The cursor's own timings below (`move`/`clickAt`/
   *  `ripple`) are all measured from this appearance moment. Default 0. */
  startAt?: number;
  /** Point the cursor glides in FROM, as fractions (0–1) of the frame.
   *  Default { x: 0.68, y: 0.95 } = lower-right. */
  from?: { x: number; y: number };
  /** Travel time (ms) for the cursor to reach the target. Default 560. */
  move?: number;
  /** When the click happens, after the cursor appears (ms). Default 720. */
  clickAt?: number;
  /** How long the click ripple expands & fades (ms). Default 480. */
  ripple?: number;
  /** Max ripple diameter in frame px. Default 150. */
  rippleSize?: number;
}

/* -----------------------------------------------------------------------------
   SHOT — one camera framing in a filmed scene. Tune `move` (glide-in), `hold`
   (still), `pad` (zoom tightness). A filmed scene plays its shots top-to-bottom.
   --------------------------------------------------------------------------- */
export interface Shot {
  /** WHAT to frame. Selector(s) inside the filmed page; multiple → bounding
   *  union of all matches. Use stable aria/semantic selectors (CSS-module class
   *  names are hashed and won't work). */
  target: string | string[];
  /** GLIDE duration (ms): time animating from the previous shot into this one.
   *  This is the ONLY moment the framing changes — bigger = slower camera move. */
  move: number;
  /** HOLD duration (ms): time the camera sits perfectly still on this shot. */
  hold: number;
  /** ZOOM tightness: padding (world px) around the target. Smaller = tighter.
   *  Default 24. */
  pad?: number;
  /** Lower-third caption shown while on this shot (fades in/out with the shot). */
  caption?: string;
  /** Small mono kicker line shown above the caption. */
  kicker?: string;
  /** Animated cursor that glides in and clicks the framed target during this
   *  shot's hold. Presence enables it; see CursorClick for the knobs. */
  cursorClick?: CursorClick;
}

/** Storage values to pre-set while filming so the page looks populated. */
export interface SeedMap {
  session?: Record<string, string>;
  local?: Record<string, string>;
}

/** Props every scene component receives from the sequence's clock. */
export interface SceneProps {
  /** Scene-local playhead, ms (0 at the start of this scene). */
  t: number;
  /** This scene's length, ms. */
  duration: number;
  /** True only for the scene currently on screen. Preloaded-but-hidden scenes
   *  receive false — they should stay idle (but mounted) until activated. */
  active?: boolean;
}

/** One scene in a piece. */
export interface Scene {
  id: string;
  /** Short label for the player's scene list. */
  title: string;
  /** Length, ms. */
  duration: number;
  /** The clock-driven component to render. */
  Component: ComponentType<SceneProps>;
  /** Keep this scene MOUNTED (hidden) the whole time so a heavy resource (e.g.
   *  an iframe) is preloaded and never reloads at the cut. The component gets
   *  `active=false` until it's the current scene. */
  preload?: boolean;
}

export interface MotionPiece {
  id: string;
  title: string;
  /** One-line pitch shown on the gallery card. */
  tagline: string;
  /** Longer blurb shown on the player page. */
  description: string;
  /** Ordered scenes played as one continuous flow. */
  scenes: Scene[];
}

/* ---- SCENES --------------------------------------------------------------
   Define each scene once, then compose pieces from them. */
const SCENE_WORKFLOW: Scene = {
  id: 'workflow',
  title: '워크플로우',
  duration: WORKFLOW_SCENE_DURATION,
  Component: WorkflowScene,
};

const SCENE_ASSETS: Scene = {
  id: 'assets',
  title: '애셋 추출',
  duration: ASSET_EXTRACT_DURATION,
  Component: AssetExtractScene,
};

const SCENE_PROMPTS: Scene = {
  id: 'prompts',
  title: '프롬프트 추출',
  duration: PROMPT_EXTRACT_DURATION,
  Component: PromptExtractScene,
};

const SCENE_TRANSITION: Scene = {
  id: 'transition',
  title: '프롬프트 화면 전환',
  duration: TRANSITION_DURATION,
  Component: TransitionToPromptScene,
};

const SCENE_PROMPT_SCROLL: Scene = {
  id: 'prompt-scroll',
  title: '프롬프트 스크롤',
  duration: PROMPT_SCROLL_DURATION,
  Component: PromptScrollScene,
  preload: true, // keep its iframe loaded so the 4→5 cut has no black flash
};

export const MOTION_PIECES: MotionPiece[] = [
  // Full integrated flow — every scene in order.
  {
    id: 'full-demo',
    title: '풀 데모 (통합)',
    tagline: '스토리보드 업로드부터 애셋 추출까지, 모든 씬을 하나의 흐름으로.',
    description:
      '모든 씬을 순서대로 이어 붙인 통합 광고입니다. 씬 사이는 짧은 디졸브로 연결됩니다.',
    scenes: [
      SCENE_WORKFLOW,
      SCENE_ASSETS,
      SCENE_PROMPTS,
      SCENE_TRANSITION,
      SCENE_PROMPT_SCROLL,
    ],
  },

  // Individual scenes — handy for iterating on one scene in isolation.
  {
    id: 'workflow-walkthrough',
    title: '01 · 워크플로우 워크스루',
    tagline: '스토리보드 한 장에서 영상 프롬프트까지 — 실제 화면을 따라가는 컷.',
    description:
      'PreVisAI 스토리보드 워크플로우 화면을 카메라가 클로즈업으로 훑으며, 스토리보드 업로드 → 원클릭 파이프라인 실행으로 이어집니다.',
    scenes: [SCENE_WORKFLOW],
  },
  {
    id: 'asset-extraction',
    title: '02 · 애셋 추출',
    tagline: '스토리보드에서 인물·장소·오브젝트를 자동으로 추출.',
    description:
      '스토리보드 위 각 요소에 박스가 그려지고, 캐릭터·장소·오브젝트 애셋이 오른쪽 피드로 차곡차곡 추출되는 연출입니다.',
    scenes: [SCENE_ASSETS],
  },
  {
    id: 'prompt-extraction',
    title: '03 · 프롬프트 추출',
    tagline: '스토리보드 각 샷에서 생성 프롬프트 + 모션 벡터 JSON을 추출.',
    description:
      '스토리보드 패널마다 박스가 그려지고, 샷별 프롬프트 + 모션 벡터 JSON이 오른쪽 피드로 차곡차곡 출력되는 연출입니다.',
    scenes: [SCENE_PROMPTS],
  },
  {
    id: 'prompt-transition',
    title: '04 · 프롬프트 화면 전환',
    tagline: '스토리보드 5번 패널로 줌인하며 프롬프트 화면으로 전환.',
    description:
      '스토리보드 5번 패널로 밀고 들어간 뒤, 해당 패널의 프롬프트 화면(포커스 카드)으로 크로스 디졸브되는 전환 연출입니다.',
    scenes: [SCENE_TRANSITION],
  },
  {
    id: 'prompt-scroll',
    title: '05 · 프롬프트 스크롤',
    tagline: '실제 프롬프트 페이지의 업스크롤을 따라가며 전체 화면으로 줌아웃.',
    description:
      '실제 PromptScroller 페이지를 그대로 띄워, 내장된 아래→위 스크롤 애니메이션이 도는 동안 포커스 카드에서 전체 스크롤러 화면으로 줌아웃하는 연출입니다.',
    scenes: [SCENE_PROMPT_SCROLL],
  },
];

/** Total loop length of a piece, ms — the sum of its scenes. */
export const pieceDuration = (p: MotionPiece): number =>
  p.scenes.reduce((sum, s) => sum + s.duration, 0);

export const findPiece = (id: string | undefined): MotionPiece | undefined =>
  MOTION_PIECES.find((p) => p.id === id);
