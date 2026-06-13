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
              <PanelCrop
                panel={panel}
                index={i}
                storyboardPreview={storyboardPreview}
              />
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

/** Left-side storyboard crop. Real crop if provided, else a slice of the full
 *  storyboard image, else a labeled placeholder. */
function PanelCrop({
  panel,
  index,
  storyboardPreview,
}: {
  panel: ScenePanel;
  index: number;
  storyboardPreview: string | null;
}) {
  if (panel.image) {
    return (
      <div
        className={styles.crop}
        style={{ backgroundImage: `url(${panel.image})` }}
        role="img"
        aria-label={panel.label}
      />
    );
  }

  if (storyboardPreview) {
    // Fake a per-panel crop by sampling a region of the full storyboard.
    const cols = 3;
    const x = ((index % cols) / (cols - 1)) * 100;
    const y = (Math.floor(index / cols) % 2) * 100;
    return (
      <div
        className={styles.crop}
        style={{
          backgroundImage: `url(${storyboardPreview})`,
          backgroundSize: '260% auto',
          backgroundPosition: `${x}% ${y}%`,
        }}
        role="img"
        aria-label={panel.label}
      />
    );
  }

  return (
    <div className={`${styles.crop} ${styles.cropPlaceholder}`}>
      <span>스토리보드 크롭</span>
    </div>
  );
}
