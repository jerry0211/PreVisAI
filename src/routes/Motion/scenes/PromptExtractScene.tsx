import { buildPlaceholderPanels } from '@/routes/StoryboardWorkflow/scenes';
import { PromptCard } from '@/routes/StoryboardWorkflow/PromptCard';
import { clamp01, easeOutBack, easeOutCubic, lerp, span } from '../timeline';
import { PROMPT_LAYOUT } from './promptLayout';
import type { SceneProps } from '../pieces';
import styles from './PromptExtractScene.module.css';

/* Each feed card is the REAL PromptScroller card, rendered at its real
   proportions (logical size) and scaled DOWN to fit the narrow feed — so fonts,
   padding and the crop tile keep the exact page proportions, and the panel-#5
   card can later scale 1:1 into the full-size card (scene 4 → 5). */
const {
  cardW: CARD_W,
  cardH: CARD_H,
  cardScale: CARD_SCALE,
  slotW: SLOT_W,
  slotH: SLOT_H,
  cropH: CROP_H,
} = PROMPT_LAYOUT;

/* =============================================================================
   SCENE 3 — PROMPT EXTRACTION
   -----------------------------------------------------------------------------
   Same shape as scene 2 (AssetExtractScene), but the boxes are drawn per
   storyboard PANEL/SHOT and each one outputs a prompt+vectors JSON card on the
   right (mirrors PromptScroller). A bespoke, clock-driven scene.
   ========================================================================== */

/* The uploaded Parasite storyboard (public asset). */
const STORYBOARD = encodeURI('/outputs/Storyboard Splits/스토리보드.jpg');

/* --- TIMING (ms) — tune the pacing here ----------------------------------- */
const INTRO = 700; // storyboard slides/fades in
const STEP = 1150; // gap between each extraction
const BOX_DRAW = 340; // box draw-on animation
const CARD_DELAY = 220; // box → card appears
const CARD_ANIM = 460; // card rise-in animation
const TAIL = 1800; // hold at the end before the loop

/* --- BOXES ON THE STORYBOARD ----------------------------------------------
   Per-panel rectangle drawn on the board, in FRACTIONS (0–1) of the storyboard
   image. Keyed by panel id (see StoryboardWorkflow/scenes.ts). Order = feed
   order. Tune these to sit on each panel of the hand-drawn board. */
interface BoxFrac {
  x: number;
  y: number;
  w: number;
  h: number;
}
const BOXES: Record<string, BoxFrac> = {
  panel_01: { x: 0.15, y: 0.08, w: 0.41, h: 0.125 }, // ① pizza box CU
  panel_02: { x: 0.15, y: 0.21, w: 0.8, h: 0.31 }, // ② wide semi-basement
  panel_03: { x: 0.22, y: 0.53, w: 0.36, h: 0.10 }, // ③ phone CU
  panel_04: { x: 0.14, y: 0.63, w: 0.49, h: 0.15 }, // ④⑥ faces
  panel_05: { x: 0.14, y: 0.8, w: 0.43, h: 0.14 }, // ⑦ track-in / fog
};

/* The full set of storyboard panels, in feed order. */
const PANELS = buildPlaceholderPanels();

export const PROMPT_EXTRACT_DURATION = INTRO + PANELS.length * STEP + TAIL;

/** `entrance` (default true) plays the box-draw + card rise-in. When false, the
 *  scene renders its FINAL state immediately (everything present, no motion) —
 *  used when another scene wants the already-extracted board to zoom into. */
export function PromptExtractScene({
  t,
  entrance = true,
}: SceneProps & { entrance?: boolean }) {
  const capP = entrance ? span(t, 200, 700) : 1;

  const extracted = entrance
    ? PANELS.filter((_, i) => t >= INTRO + i * STEP + CARD_DELAY).length
    : PANELS.length;

  return (
    <div className={styles.frame}>
      <div className={styles.stage}>
        {/* LEFT — storyboard. Shown INSTANTLY (no intro) so it looks continuous
            with the previous scene's board at the same position. */}
        <div className={styles.boardCol}>
          <div className={styles.board}>
            <img className={styles.boardImg} src={STORYBOARD} alt="storyboard" />
            {PANELS.map((panel, i) => {
              const box = BOXES[panel.id];
              if (!box) return null;
              const start = INTRO + i * STEP;
              if (entrance && t < start) return null;
              const bp = entrance
                ? clamp01(easeOutBack(clamp01((t - start) / BOX_DRAW)))
                : 1;
              return (
                <span
                  key={panel.id}
                  className={styles.box}
                  style={{
                    left: `${box.x * 100}%`,
                    top: `${box.y * 100}%`,
                    width: `${box.w * 100}%`,
                    height: `${box.h * 100}%`,
                    opacity: bp,
                    transform: `scale(${lerp(1.08, 1, bp)})`,
                  }}
                >
                  <span className={styles.boxTag}>
                    {String(panel.data.panel).padStart(2, '0')}
                  </span>
                </span>
              );
            })}
          </div>
        </div>

        {/* RIGHT — extracted prompt-JSON feed (bottom-anchored, rises up) */}
        <div className={styles.feedCol}>
          <span className={styles.feedHead} style={{ opacity: capP }}>
            생성된 프롬프트 · {extracted}/{PANELS.length}
          </span>
          <div className={styles.feed}>
            {PANELS.map((panel, i) => {
              const cardStart = INTRO + i * STEP + CARD_DELAY;
              if (entrance && t < cardStart) return null;
              const cp = entrance
                ? easeOutCubic(clamp01((t - cardStart) / CARD_ANIM))
                : 1;
              return (
                <div
                  key={panel.id}
                  className={styles.cardSlot}
                  style={{
                    width: SLOT_W,
                    opacity: cp,
                    transform: `translateY(${lerp(20, 0, cp)}px)`,
                    // grow the displayed height so the bottom-anchored stack
                    // scrolls up smoothly and cards stay uniform
                    height: `${lerp(0, SLOT_H, cp)}px`,
                  }}
                >
                  {/* the real PromptScroller card at real proportions, scaled down */}
                  <div
                    className={styles.cardLogical}
                    style={{
                      width: CARD_W,
                      height: CARD_H,
                      transform: `scale(${CARD_SCALE})`,
                      ['--prompt-crop-h' as string]: `${CROP_H}px`,
                    }}
                  >
                    <PromptCard panel={panel} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* caption */}
      <div className={styles.caption} style={{ opacity: capP }}>
        <span className={styles.kicker}>PROMPTS · 자동 생성</span>
        <span className={styles.captionText}>샷별 프롬프트 + 모션 벡터</span>
      </div>

      <div className={styles.vignette} aria-hidden="true" />
    </div>
  );
}
