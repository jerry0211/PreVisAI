import { useEffect, useRef, useState } from 'react';
import { buildPlaceholderPanels } from '@/routes/StoryboardWorkflow/scenes';
import { PromptCard } from '@/routes/StoryboardWorkflow/PromptCard';
import { clamp01, easeInOutCubic, easeOutCubic, lerp, span } from '../timeline';
import { PromptExtractScene } from './PromptExtractScene';
import { PROMPT_LAYOUT } from './promptLayout';
import type { SceneProps } from '../pieces';
import styles from './TransitionToPromptScene.module.css';

/* =============================================================================
   SCENE 4 — TRANSITION INTO THE PROMPT VIEW
   -----------------------------------------------------------------------------
   Opens as the exact final frame of scene 3 (the extracted prompt board), then
   takes the SAME panel-#5 card — the real PromptCard at its real proportions —
   and enlarges it IN PLACE from its feed slot to a centered focus card, while
   the rest fades away. Same card element (seamless) rendered at full resolution
   (it scales DOWN from logical size, so it stays sharp). Hands off to scene 5.
   ========================================================================== */

/* --- TIMING (ms) ----------------------------------------------------------- */
const MOVE = [150, 1500] as const; // card travels from feed slot → centre
const BASE_FADE = [150, 650] as const; // the rest of the board fades out
export const TRANSITION_DURATION = 2800;

/* End framing of the focus card, as a fraction of the frame width — nearly
   fills the width so it matches scene 5's zoomed-in opening (the active card). */
const END_W_FRAC = 0.95;

/* After the move, settle into scene 5's first frame: the active PromptScroller
   card is slightly popped (scale 1.01) with an accent border. Pre-animate that
   here so the 4→5 cut is seamless. */
const SETTLE = [MOVE[1], MOVE[1] + 450] as const;
const POP = 1.01; // match the active card's scale(1.01) — tune to match scene 5

const PANELS = buildPlaceholderPanels();
const PANEL = PANELS[PANELS.length - 1]; // board #5 = last panel

export function TransitionToPromptScene({ t }: SceneProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 1280, h: 720 });

  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const measure = () =>
      setSize({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { w, h } = size;
  const { padX, padY, feedW, cardW, cardH, cardScale, slotW, slotH } =
    PROMPT_LAYOUT;

  // START rect = where the panel-#5 card sits in the feed (bottom of the feed,
  // centred in the feed column). Must match PromptExtractScene's layout exactly.
  const startX = w - padX - feedW + (feedW - slotW) / 2;
  const startY = h - padY - slotH;
  const startS = cardScale;

  // END rect = a centred focus card.
  const endW = w * END_W_FRAC;
  const endS = endW / cardW;
  const endX = (w - endW) / 2;
  const endY = (h - cardH * endS) / 2;

  const p = easeInOutCubic(clamp01(span(t, MOVE[0], MOVE[1])));
  const x = lerp(startX, endX, p);
  const y = lerp(startY, endY, p);
  const s = lerp(startS, endS, p);

  // Settle: pop + accent border fade in after the move, matching scene 5.
  const settle = easeOutCubic(clamp01(span(t, SETTLE[0], SETTLE[1])));
  const pop = lerp(1, POP, settle);

  const baseOpacity = 1 - span(t, BASE_FADE[0], BASE_FADE[1]);
  const capP = span(t, 250, 700) * (1 - span(t, MOVE[1] - 200, MOVE[1] + 300));

  return (
    <div ref={frameRef} className={styles.frame}>
      {/* opens identical to scene 3's final frame, then fades */}
      <div className={styles.base} style={{ opacity: baseOpacity }}>
        <PromptExtractScene t={0} duration={0} entrance={false} />
      </div>

      {/* the SAME panel-#5 card, enlarging from its feed slot to the centre */}
      <div
        className={styles.hero}
        style={{
          width: cardW,
          height: cardH,
          transform: `translate(${x}px, ${y}px) scale(${s})`,
          // crop tile matches the feed card so the shape is identical
          ['--prompt-crop-h' as string]: `${PROMPT_LAYOUT.cropH}px`,
        }}
      >
        {/* inner pop (scale from centre) + accent border, to land on scene 5's
            first frame (active card) */}
        <div className={styles.pop} style={{ transform: `scale(${pop})` }}>
          <PromptCard panel={PANEL} />
          <div className={styles.activeBorder} style={{ opacity: settle }} />
        </div>
      </div>

      <div className={styles.caption} style={{ opacity: capP }}>
        <span className={styles.kicker}>PROMPT VIEW</span>
        <span className={styles.captionText}>프롬프트 화면으로</span>
      </div>

      <div className={styles.vignette} aria-hidden="true" />
    </div>
  );
}
