import { useEffect, useRef, useState } from 'react';
import {
  clamp01,
  easeInOutCubic,
  envelope,
  lerp,
} from './timeline';
import type { Shot } from './pieces';
import styles from './CameraStage.module.css';

/* The fixed 16:9 design frame the camera composes within. All camera math is
   done in these logical units, then the whole frame is scaled to fit whatever
   box the stage is rendered in (see the ResizeObserver below). */
const FRAME_W = 1280;
const FRAME_H = 720;
const FRAME_RATIO = FRAME_W / FRAME_H;

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface CameraStageProps {
  /** Route to film, e.g. "/workflow". Loaded in an isolated iframe "world". */
  src: string;
  /** CSS pixel width of the filmed page (its viewport). */
  worldWidth: number;
  /** Ordered shot list — the camera glides between these element rects. */
  shots: Shot[];
  /** Playhead, ms. */
  t: number;
  /** sessionStorage values to set while filming (e.g. an active project) so the
   *  page renders in a populated state. Restored on unmount. */
  seed?: Record<string, string>;
}

/* --- rect helpers (all in world pixel space) ------------------------------ */

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

/** Slow continued push-in while holding on a shot, for a living frame. */
const drift = (r: Rect, hp: number): Rect =>
  expandRect(r, lerp(1, 0.95, clamp01(hp)));

/** Turn a 16:9 world rect into the transform that maps it onto the design
 *  frame's top-left → bottom-right. */
const transformFor = (r: Rect): string => {
  const s = FRAME_W / r.w;
  return `translate(${-r.x * s}px, ${-r.y * s}px) scale(${s})`;
};

function applySeed(seed?: Record<string, string>): () => void {
  if (!seed) return () => {};
  const prev: Record<string, string | null> = {};
  for (const [k, v] of Object.entries(seed)) {
    prev[k] = sessionStorage.getItem(k);
    sessionStorage.setItem(k, v);
  }
  return () => {
    for (const k of Object.keys(seed)) {
      const p = prev[k];
      if (p == null) sessionStorage.removeItem(k);
      else sessionStorage.setItem(k, p);
    }
  };
}

/**
 * Films a live app route through a tight, moving camera. The route renders in
 * an iframe (so its own `100vh` / sticky / fixed layout resolves against a real
 * viewport), and we transform that iframe to zoom into one element at a time —
 * the full page is almost never shown. Shots target stable selectors and are
 * measured live, so the framing tracks the real layout.
 */
export function CameraStage({
  src,
  worldWidth,
  shots,
  t,
  seed,
}: CameraStageProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [fitScale, setFitScale] = useState(1);
  const [worldH, setWorldH] = useState(900);
  const [ready, setReady] = useState(false);

  // Seed sessionStorage before the iframe's document mounts and reads it.
  const restoreRef = useRef<() => void>();
  const seededRef = useRef(false);
  if (!seededRef.current) {
    restoreRef.current = applySeed(seed);
    seededRef.current = true;
  }
  useEffect(() => () => restoreRef.current?.(), []);

  // Scale the logical 16:9 frame to fill the rendered box.
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const measure = () => setFitScale(el.clientWidth / FRAME_W);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const onLoad = () => {
    const doc = iframeRef.current?.contentDocument;
    if (doc) {
      doc.documentElement.style.pointerEvents = 'none';
      const h = Math.max(900, doc.documentElement.scrollHeight);
      setWorldH(h);
    }
    setReady(true);
  };

  /** Measured, padded, 16:9 framing for shot i — or null if not yet present. */
  const shotRect = (i: number): Rect | null => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc) return null;
    const shot = shots[i];
    const sel = Array.isArray(shot.target) ? shot.target.join(',') : shot.target;
    const els = doc.querySelectorAll(sel);
    if (!els.length) return null;
    let x0 = Infinity;
    let y0 = Infinity;
    let x1 = -Infinity;
    let y1 = -Infinity;
    els.forEach((e) => {
      const r = e.getBoundingClientRect();
      x0 = Math.min(x0, r.left);
      y0 = Math.min(y0, r.top);
      x1 = Math.max(x1, r.right);
      y1 = Math.max(y1, r.bottom);
    });
    return aspectFit(padRect({ x: x0, y: y0, w: x1 - x0, h: y1 - y0 }, shot.pad ?? 24));
  };

  // Fallback framing before the page is measurable: a centered region.
  const fallback = aspectFit({
    x: worldWidth * 0.15,
    y: worldH * 0.12,
    w: worldWidth * 0.7,
    h: worldH * 0.5,
  });

  const cam = computeCamera(t, shots, shotRect, fallback);
  const active = shots[cam.index];

  return (
    <div ref={frameRef} className={styles.frame}>
      <div
        className={styles.fit}
        style={{ width: FRAME_W, height: FRAME_H, transform: `scale(${fitScale})` }}
      >
        <div
          className={styles.world}
          style={{
            width: worldWidth,
            height: worldH,
            transform: cam.transform,
          }}
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
            style={{ width: worldWidth, height: worldH }}
          />
        </div>
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

interface CameraState {
  transform: string;
  index: number;
  caption: number;
}

/** Resolve the camera transform + active shot for the current time. */
function computeCamera(
  t: number,
  shots: Shot[],
  shotRect: (i: number) => Rect | null,
  fallback: Rect
): CameraState {
  const rectAt = (i: number) => shotRect(i) ?? fallback;
  // Open on a wider push-in of the very first shot.
  let prev = expandRect(rectAt(0), 1.6);
  let acc = 0;

  for (let i = 0; i < shots.length; i++) {
    const { move, hold } = shots[i];
    const cur = rectAt(i);
    const segEnd = acc + move + hold;
    const cap = envelope(t, acc, segEnd, 380);

    if (t < acc + move) {
      const p = easeInOutCubic(clamp01((t - acc) / move));
      return { transform: transformFor(lerpRect(prev, cur, p)), index: i, caption: cap };
    }
    if (t < segEnd) {
      const hp = (t - (acc + move)) / hold;
      return { transform: transformFor(drift(cur, hp)), index: i, caption: cap };
    }
    acc = segEnd;
    prev = cur;
  }

  const lastIndex = shots.length - 1;
  return { transform: transformFor(drift(rectAt(lastIndex), 1)), index: lastIndex, caption: 0 };
}
