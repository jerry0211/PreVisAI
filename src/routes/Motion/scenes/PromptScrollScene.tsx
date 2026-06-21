import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { clamp01, easeInOutCubic, lerp, span } from '../timeline';
import { ClickCursor } from '../ClickCursor';
import type { SceneProps } from '../pieces';
import styles from './PromptScrollScene.module.css';

/* =============================================================================
   SCENE 5 — RESULT VIEW (the up-scroll, then pull back)
   -----------------------------------------------------------------------------
   Films the REAL ResultView (/film/prompts) in an iframe. The camera opens
   framed on the active prompt card (centre of the scroller) — matching scene
   4's focus card — holds briefly (seam), then pulls back to the WHOLE
   ResultView while the scroller plays its built-in bottom→top intro. The camera
   is a transform on the iframe's DOCUMENT, so it stays sharp.
   ========================================================================== */

const FRAME_W = 1280;
const FRAME_H = 720;
const CARD_H = FRAME_H * 0.5; // the active card is a 50vh row

const CARD_FILL = 0.84; // active card fills this much of the frame height (match scene 4)
const HOLD = 360; // hold on the seam-matched card before pulling back
const ZOOM_OUT = [HOLD, HOLD + 1600] as const; // then pull back to the full page

/* Scene 6 (folded in): after the pull-back settles, a cursor glides in and
   clicks the top "에셋보드" tab (which switches the page to the AssetBoard). */
const CURSOR_START = 2250; // when the cursor appears (after the pull-back)
const CURSOR_MOVE = 620; // travel time to the button
const CURSOR_CLICK = 780; // moment of the click (from appearance)
const CURSOR_RIPPLE = 480;
const CLICK_T = CURSOR_START + CURSOR_CLICK; // absolute click moment

/* Scene 7 (folded in): then the camera slowly pans down the AssetBoard page. */
const ASSET_SCROLL = [CLICK_T + 450, CLICK_T + 450 + 2800] as const;
export const PROMPT_SCROLL_DURATION = ASSET_SCROLL[1] + 700;

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function PromptScrollScene({ t, active = false }: SceneProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [fit, setFit] = useState(1);
  const [ready, setReady] = useState(false);
  const [scroller, setScroller] = useState<Rect | null>(null);
  const [assetBtn, setAssetBtn] = useState<{ x: number; y: number } | null>(null);
  const [pageH, setPageH] = useState(FRAME_H);
  const playedRef = useRef(false);
  const tabClickedRef = useRef(false);

  const ASSET_TAB = '[aria-label="result views"] button:nth-of-type(2)';

  // Scale the logical 1280×720 frame to fill the rendered box.
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const measure = () => setFit(el.clientWidth / FRAME_W);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const scrollerEl = () =>
    iframeRef.current?.contentDocument?.querySelector<HTMLElement>(
      '[data-prompt-scroller]'
    ) ?? null;

  // Measure the scroller's untransformed rect (for the camera's centre).
  const measure = () => {
    const html = iframeRef.current?.contentDocument?.documentElement;
    const sc = scrollerEl();
    if (!html || !sc) return;
    const prev = html.style.transform;
    html.style.transform = 'none';
    const r = sc.getBoundingClientRect();
    const btn = iframeRef.current?.contentDocument?.querySelector<HTMLElement>(
      ASSET_TAB
    );
    const br = btn?.getBoundingClientRect();
    html.style.transform = prev;
    setScroller({ x: r.left, y: r.top, w: r.width, h: r.height });
    if (br) setAssetBtn({ x: br.left + br.width / 2, y: br.top + br.height / 2 });
  };

  // Preloaded iframe — when this scene becomes active, jump to the bottom
  // (panel 5, matching scene 4) and replay the page's built-in up-scroll.
  useEffect(() => {
    if (active && ready && !playedRef.current) {
      measure();
      const sc = scrollerEl();
      if (sc) sc.scrollTop = sc.scrollHeight - sc.clientHeight;
      iframeRef.current?.contentWindow?.postMessage('previs:replay', '*');
      playedRef.current = true;
    }
    if (!active) playedRef.current = false;
    // measure / scrollerEl read refs only — intentionally run on active/ready.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, ready]);

  // At the cursor's click moment, actually switch to the 에셋보드 tab; then
  // measure the AssetBoard page height for the pan-down (scene 7).
  useEffect(() => {
    if (active && t >= CLICK_T && !tabClickedRef.current) {
      iframeRef.current?.contentDocument
        ?.querySelector<HTMLElement>(ASSET_TAB)
        ?.click();
      tabClickedRef.current = true;
      requestAnimationFrame(() => {
        const d = iframeRef.current?.contentDocument;
        if (d) setPageH(d.documentElement.scrollHeight);
      });
    }
    if (t < CLICK_T) tabClickedRef.current = false; // reset for the loop
  }, [t, active]);

  // Camera: frame the active card (centre of the scroller) at the start, pull
  // back to the full page (identity), then slowly pan DOWN the AssetBoard.
  const p = active ? easeInOutCubic(clamp01(span(t, ZOOM_OUT[0], ZOOM_OUT[1]))) : 0;
  const panP = active
    ? easeInOutCubic(clamp01(span(t, ASSET_SCROLL[0], ASSET_SCROLL[1])))
    : 0;
  const panY = panP * Math.max(0, pageH - FRAME_H);

  let transform = 'none';
  if (scroller) {
    const cx = scroller.x + scroller.w / 2;
    const cy = scroller.y + scroller.h / 2;
    const startScale = (FRAME_H * CARD_FILL) / CARD_H;
    const startTx = FRAME_W / 2 - cx * startScale;
    const startTy = FRAME_H / 2 - cy * startScale;
    const s = lerp(startScale, 1, p);
    const tx = lerp(startTx, 0, p);
    const ty = lerp(startTy, 0, p) - panY; // pan down once zoomed out
    transform = `translate(${tx}px, ${ty}px) scale(${s})`;
  }

  // Apply the camera on the iframe's document (sharp), re-applied on
  // activation / load so it's reliable across the preload → active hand-off.
  useLayoutEffect(() => {
    const html = iframeRef.current?.contentDocument?.documentElement;
    if (!html) return;
    html.style.transformOrigin = '0 0';
    html.style.transform = transform;
  }, [transform, active, ready]);

  const onLoad = () => {
    const doc = iframeRef.current?.contentDocument;
    if (doc) doc.documentElement.style.pointerEvents = 'none';
    measure();
    setReady(true);
  };

  return (
    <div ref={frameRef} className={styles.frame}>
      <div
        className={styles.fit}
        style={{ width: FRAME_W, height: FRAME_H, transform: `scale(${fit})` }}
      >
        <iframe
          ref={iframeRef}
          className={styles.iframe}
          src="/film/prompts"
          title="Result view"
          scrolling="no"
          tabIndex={-1}
          aria-hidden="true"
          onLoad={onLoad}
          style={{ width: FRAME_W, height: FRAME_H }}
        />

        {/* scene 6: cursor glides in and clicks the top "에셋보드" tab (hidden
            once the AssetBoard pan-down begins) */}
        {active && assetBtn && t >= CURSOR_START && t < ASSET_SCROLL[0] && (
          <ClickCursor
            t={t - CURSOR_START}
            x={assetBtn.x}
            y={assetBtn.y}
            fromX={FRAME_W * 0.5}
            fromY={FRAME_H * 0.92}
            size={52}
            move={CURSOR_MOVE}
            clickAt={CURSOR_CLICK}
            ripple={CURSOR_RIPPLE}
          />
        )}
      </div>
      <div className={styles.vignette} aria-hidden="true" />
    </div>
  );
}
