import { useEffect, useRef } from 'react';
import { Pill } from '@/components/Pill/Pill';
import { downloadFile } from '@/lib/download';
import type { ScenePanel } from './scenes';
import styles from './PromptScroller.module.css';

interface PromptScrollerProps {
  panels: ScenePanel[];
  /** Full storyboard image — used to fake per-panel crops until real ones exist. */
  storyboardPreview: string | null;
  /** Index of the current (focused) row. Owned by the parent so the scenario
   *  panel can highlight + scroll in sync. */
  active: number;
  onActiveChange: (index: number) => void;
}

/**
 * Vertical focus list: the row nearest the viewport center is the "current"
 * row (full size, ~50% of the screen, highlighted) while the rows above and
 * below recede — scaled down, faded, and stacked behind it. Scrolling moves
 * the focus. Each current row shows a storyboard crop on the left and the
 * combined prompt+vectors JSON on the right.
 */
export function PromptScroller({
  panels,
  storyboardPreview,
  active,
  onActiveChange,
}: PromptScrollerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<Array<HTMLDivElement | null>>([]);

  // Intro animation: on first mount, start scrolled to the bottom row and
  // glide up to the top row. Scroll-snap is suspended during the glide.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const DURATION = 1500;
    const ease = (t: number) => 1 - Math.pow(1 - t, 3); // easeOutCubic
    let raf = 0;
    let start = 0;
    let max = 0;

    el.style.scrollSnapType = 'none';
    el.scrollTop = el.scrollHeight - el.clientHeight; // jump to bottom

    const step = (ts: number) => {
      if (!start) {
        start = ts;
        max = el.scrollTop;
      }
      const p = Math.min((ts - start) / DURATION, 1);
      el.scrollTop = max * (1 - ease(p));
      if (p < 1) {
        raf = requestAnimationFrame(step);
      } else {
        el.style.scrollSnapType = '';
      }
    };
    raf = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(raf);
      el.style.scrollSnapType = '';
    };
  }, []);

  // Track which row is closest to the scroller's vertical center.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const cRect = container.getBoundingClientRect();
      const centerY = cRect.top + cRect.height / 2;
      let best = 0;
      let bestDist = Infinity;
      rowRefs.current.forEach((row, i) => {
        if (!row) return;
        const r = row.getBoundingClientRect();
        const dist = Math.abs(r.top + r.height / 2 - centerY);
        if (dist < bestDist) {
          bestDist = dist;
          best = i;
        }
      });
      onActiveChange(best);
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    container.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();

    return () => {
      container.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [panels.length, onActiveChange]);

  return (
    <div className={styles.scroller} ref={containerRef}>
      {panels.map((panel, i) => {
        const json = JSON.stringify(panel.data, null, 2);
        return (
          <div
            key={panel.id}
            ref={(el) => (rowRefs.current[i] = el)}
            className={[styles.row, i === active ? styles.rowActive : '']
              .filter(Boolean)
              .join(' ')}
            aria-current={i === active ? 'true' : undefined}
          >
            <article className={styles.card}>
              <PanelCrop panel={panel} storyboardPreview={storyboardPreview} />
              <div className={styles.body}>
                <div className={styles.bodyHead}>
                  <span className={styles.label}>{panel.label}</span>
                  <Pill
                    size="small"
                    type="button"
                    onClick={() =>
                      downloadFile(`${panel.id}.json`, json, 'application/json')
                    }
                  >
                    JSON
                  </Pill>
                </div>
                <pre className={styles.json}>{json}</pre>
              </div>
            </article>
          </div>
        );
      })}
    </div>
  );
}

/** Storyboard image shown in full on top of the card. Falls back to the
 *  uploaded storyboard, then a labeled placeholder. */
function PanelCrop({
  panel,
  storyboardPreview,
}: {
  panel: ScenePanel;
  storyboardPreview: string | null;
}) {
  const src = panel.image ?? storyboardPreview;
  if (src) {
    return <img className={styles.cropImg} src={encodeURI(src)} alt={panel.label} />;
  }

  return (
    <div className={styles.cropPlaceholder}>
      <span>스토리보드</span>
    </div>
  );
}
