/* =============================================================================
   MOTION TIMELINE — tiny helper kit for time-driven animation.
   -----------------------------------------------------------------------------
   Every motion piece is a pure function of the current clock time `t` (in ms).
   These helpers turn that scalar into the eased, clamped values a moving
   "camera" needs: local progress within a window, fade envelopes, lerps, and
   easings.

   Keep this dependency-free and framework-agnostic — it is the shared language
   that all pieces under the Motion tab speak.
   ========================================================================== */

export const clamp01 = (x: number): number => Math.min(1, Math.max(0, x));

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

/** Map a value from one range to another, clamped to the output range. */
export const mapRange = (
  x: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number => lerp(outMin, outMax, clamp01((x - inMin) / (inMax - inMin)));

/* --- easings -------------------------------------------------------------- */
export const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);
export const easeInCubic = (t: number): number => t * t * t;
export const easeInOutCubic = (t: number): number =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
export const easeOutBack = (t: number): number => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

/**
 * Linear local progress (0→1) of `t` within the window [start, end] in ms,
 * clamped at both ends. Before `start` it is 0; after `end` it is 1.
 */
export const span = (t: number, start: number, end: number): number =>
  clamp01((t - start) / (end - start));

/**
 * A fade envelope for content living in [start, end]. Ramps 0→1 over the first
 * `fade` ms, holds at 1, then ramps 1→0 over the last `fade` ms.
 */
export const envelope = (
  t: number,
  start: number,
  end: number,
  fade = 500
): number => {
  if (t <= start || t >= end) return 0;
  const inP = clamp01((t - start) / fade);
  const outP = clamp01((end - t) / fade);
  return Math.min(inP, outP);
};

/** True while `t` is anywhere inside (start - pad, end + pad). */
export const within = (
  t: number,
  start: number,
  end: number,
  pad = 0
): boolean => t > start - pad && t < end + pad;

/** Format ms as `M:SS` for timeline read-outs. */
export const formatTime = (ms: number): string => {
  const total = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};
