import { useCallback, useEffect, useRef, useState } from 'react';

export interface MotionClock {
  /** Current playhead position, ms. */
  t: number;
  /** Total loop length, ms. */
  duration: number;
  playing: boolean;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  /** Jump to 0 and start playing. */
  restart: () => void;
  /** Scrub to an absolute ms position (clamped). Does not change play state. */
  seek: (ms: number) => void;
}

/**
 * A looping requestAnimationFrame playhead. The whole Motion tab is driven by
 * this single scalar clock: every piece renders as a pure function of `t`, so
 * pausing, scrubbing, and restarting all fall out for free.
 */
export function useMotionClock(duration: number, autoplay = true): MotionClock {
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(autoplay);
  const tRef = useRef(0);
  const rafRef = useRef(0);
  const lastRef = useRef<number | null>(null);

  useEffect(() => {
    if (!playing) {
      lastRef.current = null;
      return;
    }
    const step = (now: number) => {
      if (lastRef.current == null) lastRef.current = now;
      const dt = now - lastRef.current;
      lastRef.current = now;
      let next = tRef.current + dt;
      if (duration > 0 && next >= duration) next %= duration; // seamless loop
      tRef.current = next;
      setT(next);
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [playing, duration]);

  const play = useCallback(() => setPlaying(true), []);
  const pause = useCallback(() => setPlaying(false), []);
  const toggle = useCallback(() => setPlaying((p) => !p), []);
  const restart = useCallback(() => {
    tRef.current = 0;
    lastRef.current = null;
    setT(0);
    setPlaying(true);
  }, []);
  const seek = useCallback(
    (ms: number) => {
      const clamped = Math.max(0, Math.min(duration, ms));
      tRef.current = clamped;
      lastRef.current = null;
      setT(clamped);
    },
    [duration]
  );

  return { t, duration, playing, play, pause, toggle, restart, seek };
}
