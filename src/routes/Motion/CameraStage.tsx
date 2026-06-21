import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { clamp01, easeInOutCubic, easeOutCubic, envelope, lerp } from './timeline';
import type { Shot, SeedMap, CursorClick } from './pieces';
import styles from './CameraStage.module.css';

const FRAME_RATIO = 16 / 9;

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Frame {
  w: number;
  h: number;
}

interface CameraStageProps {
  /** Route to film, e.g. "/workflow". Loaded in an isolated iframe "world". */
  src: string;
  /** CSS pixel width the page is laid out at (the iframe's viewport width). */
  worldWidth: number;
  /** Ordered shot list — the camera glides between these element rects. */
  shots: Shot[];
  /** Playhead, ms. */
  t: number;
  /** session/localStorage values to set while filming (e.g. an active project)
   *  so the page renders in a populated state. Restored on unmount. */
  seed?: SeedMap;
}

/* --- rect helpers (all in the page's own layout pixel space) --------------- */

/** Grow a rect by `p` px on every side. */
const padRect = (r: Rect, p: number): Rect => ({
  x: r.x - p,
  y: r.y - p,
  w: r.w + 2 * p,
  h: r.h + 2 * p,
});

/** Expand a rect about its center by `factor` (for a wider establishing shot). */
const expandRect = (r: Rect, factor: number): Rect => {
  const nw = r.w * factor;
  const nh = r.h * factor;
  return { x: r.x - (nw - r.w) / 2, y: r.y - (nh - r.h) / 2, w: nw, h: nh };
};

/** Grow a rect to exactly 16:9 about its center so the target is fully shown
 *  with no distortion and minimal surrounding page. */
const aspectFit = (r: Rect): Rect => {
  const ratio = r.w / r.h;
  if (ratio < FRAME_RATIO) {
    const nw = r.h * FRAME_RATIO;
    return { x: r.x - (nw - r.w) / 2, y: r.y, w: nw, h: r.h };
  }
  const nh = r.w / FRAME_RATIO;
  return { x: r.x, y: r.y - (nh - r.h) / 2, w: r.w, h: nh };
};

const lerpRect = (a: Rect, b: Rect, p: number): Rect => ({
  x: lerp(a.x, b.x, p),
  y: lerp(a.y, b.y, p),
  w: lerp(a.w, b.w, p),
  h: lerp(a.h, b.h, p),
});

/** Turn a 16:9 page rect into the transform that maps it onto the frame's
 *  top-left → bottom-right. Applied to the iframe's *document* (not the iframe
 *  element) so the browser re-rasterises the page at the zoomed scale — i.e. the
 *  crop stays sharp instead of being a magnified low-res bitmap. */
const transformFor = (r: Rect, frame: Frame): string => {
  const s = frame.w / r.w;
  return `translate(${-r.x * s}px, ${-r.y * s}px) scale(${s})`;
};

function applyToStore(
  store: Storage,
  values: Record<string, string> | undefined
): () => void {
  if (!values) return () => {};
  const prev: Record<string, string | null> = {};
  for (const [k, v] of Object.entries(values)) {
    prev[k] = store.getItem(k);
    store.setItem(k, v);
  }
  return () => {
    for (const k of Object.keys(values)) {
      const p = prev[k];
      if (p == null) store.removeItem(k);
      else store.setItem(k, p);
    }
  };
}

/** Apply a piece's seed to session + local storage; returns a restore fn. */
function applySeed(seed?: SeedMap): () => void {
  if (!seed) return () => {};
  const restoreSession = applyToStore(sessionStorage, seed.session);
  const restoreLocal = applyToStore(localStorage, seed.local);
  return () => {
    restoreSession();
    restoreLocal();
  };
}

/** Layout position+size of an element in its document, ignoring any CSS
 *  transform we apply (offset chain is transform-independent). This keeps shot
 *  framing stable even though we transform the document every frame. */
function docRect(el: HTMLElement): Rect {
  let x = 0;
  let y = 0;
  let n: HTMLElement | null = el;
  while (n) {
    x += n.offsetLeft;
    y += n.offsetTop;
    n = n.offsetParent as HTMLElement | null;
  }
  return { x, y, w: el.offsetWidth, h: el.offsetHeight };
}

/**
 * Films a live app route through a tight, moving camera. The route renders in an
 * iframe (so its own `100vh` / sticky / fixed layout resolves against a real
 * viewport). The iframe element is a FIXED 16:9 box — the camera move is a
 * transform applied to the iframe's *document content*, which the browser
 * re-rasterises at the zoom scale, so tight crops stay sharp. The full page is
 * almost never shown; shots target stable selectors and are measured live.
 */
export function CameraStage({
  src,
  worldWidth,
  shots,
  t,
  seed,
}: CameraStageProps) {
  const frame: Frame = { w: worldWidth, h: Math.round(worldWidth / FRAME_RATIO) };

  const frameRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [fitScale, setFitScale] = useState(1);
  const [ready, setReady] = useState(false);

  // Seed sessionStorage before the iframe's document mounts and reads it.
  const restoreRef = useRef<() => void>();
  const seededRef = useRef(false);
  if (!seededRef.current) {
    restoreRef.current = applySeed(seed);
    seededRef.current = true;
  }
  useEffect(() => () => restoreRef.current?.(), []);

  // Scale the logical frame to fill the rendered box.
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const measure = () => setFitScale(el.clientWidth / frame.w);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [frame.w]);

  const onLoad = () => {
    const doc = iframeRef.current?.contentDocument;
    if (doc) {
      const html = doc.documentElement;
      html.style.pointerEvents = 'none'; // non-interactive film
      html.style.transformOrigin = '0 0';
      html.style.overflow = 'hidden';
    }
    setReady(true);
  };

  /** Measured, padded, 16:9 framing for shot i — or null if not yet present. */
  const shotRect = (i: number): Rect | null => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc) return null;
    const shot = shots[i];
    const sel = Array.isArray(shot.target) ? shot.target.join(',') : shot.target;
    const els = doc.querySelectorAll<HTMLElement>(sel);
    if (!els.length) return null;
    let x0 = Infinity;
    let y0 = Infinity;
    let x1 = -Infinity;
    let y1 = -Infinity;
    els.forEach((e) => {
      const r = docRect(e);
      x0 = Math.min(x0, r.x);
      y0 = Math.min(y0, r.y);
      x1 = Math.max(x1, r.x + r.w);
      y1 = Math.max(y1, r.y + r.h);
    });
    return aspectFit(padRect({ x: x0, y: y0, w: x1 - x0, h: y1 - y0 }, shot.pad ?? 24));
  };

  // Fallback framing before the page is measurable: a centered region.
  const fallback = aspectFit({
    x: frame.w * 0.1,
    y: 0,
    w: frame.w * 0.8,
    h: frame.h * 0.8,
  });

  const cam = ready
    ? computeCamera(t, shots, shotRect, fallback, frame)
    : {
        transform: transformFor(fallback, frame),
        index: 0,
        caption: 0,
        holdT: 0,
        inHold: false,
      };

  // Drive the camera by transforming the iframe's document content.
  useLayoutEffect(() => {
    const html = iframeRef.current?.contentDocument?.documentElement;
    if (html) html.style.transform = cam.transform;
  }, [cam.transform]);

  const active = shots[cam.index];

  return (
    <div ref={frameRef} className={styles.frame}>
      <div
        className={styles.fit}
        style={{ width: frame.w, height: frame.h, transform: `scale(${fitScale})` }}
      >
        <iframe
          ref={iframeRef}
          className={styles.iframe}
          src={src}
          title="Filmed app"
          scrolling="no"
          tabIndex={-1}
          aria-hidden="true"
          onLoad={onLoad}
          style={{ width: frame.w, height: frame.h }}
        />

        {cam.inHold && active?.cursorClick && (
          <ClickCursor frame={frame} holdT={cam.holdT} cfg={active.cursorClick} />
        )}
      </div>

      <div className={styles.vignette} aria-hidden="true" />

      {active?.caption && (
        <div className={styles.caption} style={{ opacity: cam.caption }}>
          {active.kicker && <span className={styles.kicker}>{active.kicker}</span>}
          <span className={styles.captionText}>{active.caption}</span>
        </div>
      )}

      {!ready && <div className={styles.loading}>필름 로딩 중…</div>}
    </div>
  );
}

/* Fallback cursor-click settings, used for any field a shot's `cursorClick`
   leaves out. Per-shot overrides live in pieces.ts (see CursorClick). */
const CURSOR_DEFAULTS = {
  size: 44, // arrow size in frame px
  startAt: 0, // delay after hold start before the cursor appears (ms)
  from: { x: 0.68, y: 0.95 }, // entry point (fractions of the frame)
  move: 560, // travel time to the target (ms)
  clickAt: 720, // click moment (ms)
  ripple: 480, // ripple expand/fade duration (ms)
  rippleSize: 150, // max ripple diameter (frame px)
};
/* Fixed press-dip shape (depth / half-width in ms) — minor, so not exposed. */
const CURSOR_PRESS_DEPTH = 0.22;
const CURSOR_PRESS_HALF = 120;

/**
 * An animated pointer that glides in and clicks the framed target (which
 * `aspectFit` centres in the frame), with a press dip and an expanding ripple.
 * Rendered in the logical frame's coordinate space. All tunables come from the
 * shot's `cursorClick` config (`cfg`), falling back to CURSOR_DEFAULTS.
 * `holdT` is ms since the shot's hold began.
 */
function ClickCursor({
  frame,
  holdT,
  cfg,
}: {
  frame: Frame;
  holdT: number;
  cfg: CursorClick;
}) {
  const size = cfg.size ?? CURSOR_DEFAULTS.size;
  const startAt = cfg.startAt ?? CURSOR_DEFAULTS.startAt;
  const from = cfg.from ?? CURSOR_DEFAULTS.from;
  const move = cfg.move ?? CURSOR_DEFAULTS.move;
  const clickAt = cfg.clickAt ?? CURSOR_DEFAULTS.clickAt;
  const ripple = cfg.ripple ?? CURSOR_DEFAULTS.ripple;
  const rippleSize = cfg.rippleSize ?? CURSOR_DEFAULTS.rippleSize;

  // Cursor-local clock: 0 at the moment the cursor appears (startAt into hold).
  const ct = holdT - startAt;
  if (ct < 0) return null; // not on screen yet

  const entry = { x: frame.w * from.x, y: frame.h * from.y };
  const center = { x: frame.w / 2, y: frame.h / 2 };

  const p = easeOutCubic(clamp01(ct / move));
  const x = lerp(entry.x, center.x, p);
  const y = lerp(entry.y, center.y, p);

  // Quick press dip right at the click moment.
  const dip = Math.max(0, 1 - Math.abs(ct - clickAt) / CURSOR_PRESS_HALF);
  const pressScale = 1 - CURSOR_PRESS_DEPTH * dip;

  const rp = clamp01((ct - clickAt) / ripple);
  const showRipple = ct >= clickAt && rp < 1;

  return (
    <div className={styles.cursorLayer} aria-hidden="true">
      {showRipple && (
        <span
          className={styles.ripple}
          style={{
            left: center.x,
            top: center.y,
            width: lerp(rippleSize * 0.16, rippleSize, rp),
            height: lerp(rippleSize * 0.16, rippleSize, rp),
            opacity: (1 - rp) * 0.85,
          }}
        />
      )}
      <span
        className={styles.cursor}
        style={{ left: x, top: y, transform: `scale(${pressScale})` }}
      >
        <svg width={size} height={size} viewBox="0 0 32 32">
          <path
            d="M7 4 L7 27 L13 21 L17 30 L21 28 L17 19 L25 19 Z"
            fill="#fff"
            stroke="#0c090a"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </div>
  );
}

interface CameraState {
  transform: string;
  index: number;
  caption: number;
  /** ms elapsed into the current shot's HOLD phase (0 while still gliding). */
  holdT: number;
  /** True once the camera has settled (hold phase) on the current shot. */
  inHold: boolean;
}

/**
 * Resolve the camera transform + active shot for the current time `t`.
 *
 * Per-shot timing/size is tuned in the piece's shot list (pieces.ts): `move`
 * (glide-in ms), `hold` (still ms), `pad` (zoom tightness). This function just
 * plays them back. The few GLOBAL knobs live here:
 *   • intro push-in width  — the 1.6 expand factor below (how much wider the
 *     very first shot starts before settling onto shot 0)
 *   • move easing          — easeInOutCubic (the glide acceleration curve)
 *   • caption fade         — the 380ms in `envelope(...)`
 */
function computeCamera(
  t: number,
  shots: Shot[],
  shotRect: (i: number) => Rect | null,
  fallback: Rect,
  frame: Frame
): CameraState {
  const rectAt = (i: number) => shotRect(i) ?? fallback;
  // GLOBAL KNOB: open on a wider push-in of the very first shot. 1 = no push-in
  // (start exactly framed); larger = starts wider and zooms in to shot 0.
  let prev = expandRect(rectAt(0), 1.6);
  let acc = 0; // running start-time (ms) of the current shot

  for (let i = 0; i < shots.length; i++) {
    const { move, hold } = shots[i]; // per-shot knobs from pieces.ts
    const cur = rectAt(i);
    const segEnd = acc + move + hold; // this shot ends here
    const cap = envelope(t, acc, segEnd, 380); // caption fade (380ms in/out)

    if (t < acc + move) {
      // MOVE phase: glide from the previous framing to this one (only time the
      // framing changes). easeInOutCubic = the camera's acceleration curve.
      const p = easeInOutCubic(clamp01((t - acc) / move));
      return {
        transform: transformFor(lerpRect(prev, cur, p), frame),
        index: i,
        caption: cap,
        holdT: 0,
        inHold: false,
      };
    }
    if (t < segEnd) {
      // HOLD phase: framing is completely static (no push-in drift).
      return {
        transform: transformFor(cur, frame),
        index: i,
        caption: cap,
        holdT: t - (acc + move),
        inHold: true,
      };
    }
    acc = segEnd;
    prev = cur;
  }

  const lastIndex = shots.length - 1;
  return {
    transform: transformFor(rectAt(lastIndex), frame),
    index: lastIndex,
    caption: 0,
    holdT: 0,
    inHold: true,
  };
}
