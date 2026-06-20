/* =============================================================================
   MOTION PIECES — registry of advertising motion graphics.
   -----------------------------------------------------------------------------
   Each piece "films" a real app route through a moving camera (see
   CameraStage). A piece is just metadata plus an ordered shot list: every shot
   names a stable selector inside the filmed page, and the camera glides from
   one element to the next, cropped in tight. Add a new ad by appending a piece
   here — all files for the Motion tab live under this folder.

   Selectors target semantic / aria hooks (NOT CSS-module class names, which are
   hashed at build time and unstable).
   ========================================================================== */

export interface Shot {
  /** Selector(s) inside the filmed page to frame. Multiple → bounding union. */
  target: string | string[];
  /** ms spent gliding from the previous shot into this one. */
  move: number;
  /** ms held on this shot (with a slow push-in drift). */
  hold: number;
  /** Padding (world px) around the target. Smaller = tighter crop. */
  pad?: number;
  /** Lower-third caption shown while on this shot. */
  caption?: string;
  /** Small mono kicker above the caption. */
  kicker?: string;
}

export interface MotionPiece {
  id: string;
  title: string;
  /** One-line pitch shown on the gallery card. */
  tagline: string;
  /** Longer blurb shown on the player page. */
  description: string;
  /** Route to film. */
  src: string;
  /** Viewport width (CSS px) the page is filmed at. */
  worldWidth: number;
  /** sessionStorage seed so the filmed page looks populated. */
  seed?: Record<string, string>;
  shots: Shot[];
}

export const MOTION_PIECES: MotionPiece[] = [
  {
    id: 'workflow-walkthrough',
    title: '워크플로우 워크스루',
    tagline: '스토리보드 한 장에서 영상 프롬프트까지 — 실제 화면을 따라가는 30초 광고.',
    description:
      'PreVisAI 스토리보드 워크플로우 화면을 카메라가 클로즈업으로 훑으며, 프로젝트 선택 → 스토리보드 업로드 → 시나리오 매칭 → 원클릭 파이프라인 실행으로 이어지는 핵심 흐름을 보여줍니다.',
    src: '/workflow',
    worldWidth: 1440,
    seed: { projectName: 'Orbital Witness' },
    shots: [
      {
        target: 'h1',
        move: 1100,
        hold: 1700,
        pad: 28,
        kicker: 'PreVisAI · Studio',
        caption: '스토리보드를 영상 프롬프트로',
      },
      {
        target: 'aside[aria-label="projects"]',
        move: 950,
        hold: 1600,
        pad: 18,
        kicker: '01 · Library',
        caption: '프로젝트 라이브러리',
      },
      {
        target: 'section[aria-label="storyboard and scenario"] article:nth-of-type(1)',
        move: 950,
        hold: 1700,
        pad: 16,
        kicker: '02 · Storyboard',
        caption: '스토리보드 업로드',
      },
      {
        target: '[aria-label="input scenario"]',
        move: 950,
        hold: 1700,
        pad: 16,
        kicker: '03 · Scenario',
        caption: '시나리오 자동 매칭',
      },
      {
        target: 'section[aria-label="storyboard actions"]',
        move: 950,
        hold: 1600,
        pad: 18,
        kicker: '04 · Pipeline',
        caption: '원클릭 파이프라인 실행',
      },
      {
        target: 'section[aria-label="storyboard actions"] button',
        move: 800,
        hold: 1600,
        pad: 12,
        kicker: 'Action',
        caption: '스토리보드 분석 →',
      },
      {
        target: 'section[aria-label="storyboard and scenario"]',
        move: 1100,
        hold: 1900,
        pad: 40,
        kicker: 'PreVisAI',
        caption: 'From Script to Shot.',
      },
    ],
  },
];

/** Total loop length of a piece, ms. */
export const pieceDuration = (p: MotionPiece): number =>
  p.shots.reduce((sum, s) => sum + s.move + s.hold, 0);

export const findPiece = (id: string | undefined): MotionPiece | undefined =>
  MOTION_PIECES.find((p) => p.id === id);
