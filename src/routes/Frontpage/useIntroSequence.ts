import { useEffect, useRef, useState } from 'react';

/**
 * Drives the cinematic intro overlay:
 *   t=0                 overlay covers the page, intro.webp plays from frame 0
 *   t=INTRO_MS          one full loop done → hard-swap to the static logo
 *   t=INTRO_MS+HOLD     measure the brand-block, shrink+glide the logo to it,
 *                       fade the overlay background out (revealing the page)
 *   t=…+ZOOM_MS         overlay removed; the real brand-block is revealed
 *
 * Returns the current phase plus the refs the Frontpage must attach.
 */

const ANIM_SRC = '/assets/intro.webp';
const LOGO_SRC = '/assets/PreVisAI_logo_transparent.png';

const INTRO_MS = 4000; // one full loop of intro.webp
const HOLD_AFTER_SWAP = -200; // brief beat on the static logo before zooming
const ZOOM_MS = 1800; // matches --dur-intro-zoom

export type IntroPhase = 'intro' | 'zooming' | 'done';

export function useIntroSequence() {
  const [phase, setPhase] = useState<IntroPhase>('intro');
  const overlayRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<HTMLImageElement>(null);
  const brandBlockRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const overlay = overlayRef.current;
    const anim = animRef.current;
    if (!overlay || !anim) return;

    const timers: number[] = [];

    const setZoomTarget = () => {
      const block = brandBlockRef.current;
      if (!block) return;
      const r = block.getBoundingClientRect();
      overlay.style.setProperty('--target-x', `${r.left + r.width / 2}px`);
      overlay.style.setProperty('--target-y', `${r.top + r.height / 2}px`);
      overlay.style.setProperty('--target-w', `${r.width}px`);
    };

    const swapToLogo = () => {
      anim.src = LOGO_SRC;
    };

    const startZoom = () => {
      setZoomTarget();
      setPhase('zooming');
      timers.push(window.setTimeout(() => setPhase('done'), ZOOM_MS));
    };

    const schedule = () => {
      requestAnimationFrame(() => {
        timers.push(window.setTimeout(swapToLogo, INTRO_MS));
        timers.push(window.setTimeout(startZoom, INTRO_MS + HOLD_AFTER_SWAP));
      });
    };

    // Force playback from frame 0 every load via a per-load cache-buster, then
    // wait for the first frame to decode so the timer's t=0 lines up with it.
    anim.src = `${ANIM_SRC}?t=${performance.now()}`;
    if (typeof anim.decode === 'function') {
      anim.decode().then(schedule).catch(() => {
        anim.addEventListener('load', schedule, { once: true });
      });
    } else {
      anim.addEventListener('load', schedule, { once: true });
    }

    const onResize = () => {
      if (overlay.dataset.phase === 'zooming') setZoomTarget();
    };
    window.addEventListener('resize', onResize);

    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return { phase, overlayRef, animRef, brandBlockRef };
}
