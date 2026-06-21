import { buildPlaceholderAssets } from '@/routes/StoryboardWorkflow/assets';
import { AssetCard } from '@/routes/StoryboardWorkflow/AssetBoard';
import { clamp01, easeOutBack, easeOutCubic, lerp, span } from '../timeline';
import type { SceneProps } from '../pieces';
import styles from './AssetExtractScene.module.css';

/* =============================================================================
   SCENE 2 — ASSET EXTRACTION
   -----------------------------------------------------------------------------
   The storyboard sits on the LEFT. One by one a box is drawn on an element in
   the board, and the matching asset is "extracted" into a feed on the RIGHT.
   Each extracted card mirrors AssetBoard: image · category · name · description
   · generation prompt. The feed is bottom-anchored — the newest card rises in
   and older ones scroll up off the top. A bespoke, clock-driven scene.
   ========================================================================== */

/* The uploaded Parasite storyboard (public asset). */
const STORYBOARD = encodeURI('/outputs/Storyboard Splits/스토리보드.jpg');

/* --- TIMING (ms) — tune the pacing here ----------------------------------- */
const INTRO = 700; // storyboard slides/fades in
const STEP = 1050; // gap between each extraction
const BOX_DRAW = 340; // box draw-on animation
const CARD_DELAY = 220; // box → card appears
const CARD_ANIM = 460; // card rise-in animation
const TAIL = 1800; // hold at the end before the loop

/* --- BOXES ON THE STORYBOARD ----------------------------------------------
   Per-asset rectangle drawn on the board, in FRACTIONS (0–1) of the storyboard
   image. Keyed by asset id (see StoryboardWorkflow/assets.ts). Assets with no
   entry here (e.g. style/tone) are still extracted — just without a box. */
interface BoxFrac {
  x: number;
  y: number;
  w: number;
  h: number;
}
const BOXES: Record<string, BoxFrac> = {
  char_ki_woo: { x: 0.255, y: 0.24, w: 0.14, h: 0.13 }, // 기우 (standing)
  char_ki_taek: { x: 0.45, y: 0.33, w: 0.12, h: 0.15 }, // 기택 (sitting)
  char_chung_sook: { x: 0.6, y: 0.36, w: 0.11, h: 0.12 }, // 충숙
  char_ki_jung: { x: 0.73, y: 0.35, w: 0.15, h: 0.15 }, // 기정
  loc_semi_basement: { x: 0.13, y: 0.19, w: 0.8, h: 0.33 }, // 반지하 (panel ②)
  obj_pizza_boxes: { x: 0.32, y: 0.52, w: 0.17, h: 0.1 }, // 피자박스 (panel ③)
  obj_fumigation_fog: { x: 0.14, y: 0.8, w: 0.28, h: 0.13 }, // 소독 연막 (panel ⑦)
};

/* The full AssetBoard set, in feed order. */
const ASSETS = buildPlaceholderAssets();

export const ASSET_EXTRACT_DURATION = INTRO + ASSETS.length * STEP + TAIL;

/** `entrance` (default true) plays the box-draw + card rise-in. When false, the
 *  scene renders its FINAL state immediately (everything present, no motion). */
export function AssetExtractScene({
  t,
  entrance = true,
}: SceneProps & { entrance?: boolean }) {
  const introP = entrance ? easeOutCubic(span(t, 0, INTRO)) : 1;
  const capP = entrance ? span(t, 200, 700) : 1;

  // How many assets have been extracted so far (for the count read-out).
  const extracted = entrance
    ? ASSETS.filter((_, i) => t >= INTRO + i * STEP + CARD_DELAY).length
    : ASSETS.length;

  return (
    <div className={styles.frame}>
      <div className={styles.stage}>
        {/* LEFT — storyboard with boxes drawn on it */}
        <div className={styles.boardCol}>
          <div
            className={styles.board}
            style={{
              opacity: introP,
              transform: `translateX(${lerp(-24, 0, introP)}px) scale(${lerp(0.97, 1, introP)})`,
            }}
          >
            <img className={styles.boardImg} src={STORYBOARD} alt="storyboard" />
            {ASSETS.map((asset, i) => {
              const box = BOXES[asset.id];
              if (!box) return null;
              const start = INTRO + i * STEP;
              if (entrance && t < start) return null;
              const bp = entrance
                ? clamp01(easeOutBack(clamp01((t - start) / BOX_DRAW)))
                : 1;
              return (
                <span
                  key={asset.id}
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
                  <span className={styles.boxTag}>{asset.name}</span>
                </span>
              );
            })}
          </div>
        </div>

        {/* RIGHT — extracted asset feed (bottom-anchored, rises up) */}
        <div className={styles.feedCol}>
          <span className={styles.feedHead} style={{ opacity: capP }}>
            추출된 애셋 · {extracted}/{ASSETS.length}
          </span>
          <div className={styles.feed}>
            {ASSETS.map((asset, i) => {
              const cardStart = INTRO + i * STEP + CARD_DELAY;
              if (entrance && t < cardStart) return null;
              const cp = entrance
                ? easeOutCubic(clamp01((t - cardStart) / CARD_ANIM))
                : 1;
              return (
                <div
                  key={asset.id}
                  className={styles.cardWrap}
                  style={{
                    opacity: cp,
                    transform: `translateY(${lerp(20, 0, cp)}px)`,
                    // grow from 0 so the bottom-anchored stack scrolls up
                    // smoothly; release the clamp once settled (cards vary in
                    // height) so nothing gets cut off.
                    maxHeight: cp < 1 ? `${lerp(0, 640, cp)}px` : 'none',
                  }}
                >
                  {/* exact AssetBoard card design */}
                  <AssetCard asset={asset} />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* caption */}
      <div className={styles.caption} style={{ opacity: capP }}>
        <span className={styles.kicker}>ASSETS · 자동 추출</span>
        <span className={styles.captionText}>이미지 · 설명 · 생성 프롬프트</span>
      </div>

      <div className={styles.vignette} aria-hidden="true" />
    </div>
  );
}
