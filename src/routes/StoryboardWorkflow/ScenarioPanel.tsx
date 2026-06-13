import { useEffect, useMemo, useRef } from 'react';
import styles from './ScenarioPanel.module.css';

interface ScenarioPanelProps {
  /** Full scenario text (temporarily public/inputs/scenario.txt). */
  scenario: string;
  /** Number of panels/cuts — the scenario is split into this many segments. */
  count: number;
  /** Currently focused cut; its scenario segment is highlighted + scrolled to. */
  active: number;
}

interface Segment {
  start: number;
  end: number;
}

/**
 * Splits `text` into `n` contiguous segments on line boundaries, returning the
 * character range of each. Placeholder mapping (one segment per cut) until real
 * per-cut scenario ranges are provided.
 */
function computeSegments(text: string, n: number): Segment[] {
  const lines = text.split('\n');
  const lineOffsets: Segment[] = [];
  let offset = 0;
  for (const line of lines) {
    const start = offset;
    offset += line.length + 1; // + newline
    lineOffsets.push({ start, end: offset });
  }

  const segments: Segment[] = [];
  for (let i = 0; i < n; i += 1) {
    const startLine = Math.floor((i * lines.length) / n);
    const endLine = Math.floor(((i + 1) * lines.length) / n);
    const start = lineOffsets[startLine]?.start ?? text.length;
    const end =
      endLine <= startLine
        ? start
        : (lineOffsets[endLine - 1]?.end ?? text.length);
    segments.push({ start, end: Math.min(end, text.length) });
  }
  return segments;
}

/**
 * Left-hand panel showing the entire scenario in its own scroller. The segment
 * matching the current cut is highlighted and auto-scrolled into the center.
 */
export function ScenarioPanel({ scenario, count, active }: ScenarioPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const markRef = useRef<HTMLElement>(null);

  const segments = useMemo(
    () => computeSegments(scenario, count),
    [scenario, count],
  );

  const seg = segments[active];

  // Keep the highlighted segment centered as the active cut changes.
  useEffect(() => {
    const container = containerRef.current;
    const mark = markRef.current;
    if (!container || !mark) return;
    const top =
      mark.offsetTop - container.clientHeight / 2 + mark.offsetHeight / 2;
    container.scrollTo({ top, behavior: 'smooth' });
  }, [active, scenario]);

  return (
    <aside className={styles.panel} aria-label="scenario">
      <header className={styles.head}>
        <span className={styles.eyebrow}>시나리오</span>
        <span className={styles.cut}>
          컷 {String(active + 1).padStart(2, '0')} / {count}
        </span>
      </header>
      <div className={styles.scroller} ref={containerRef}>
        <pre className={styles.text}>
          {seg ? (
            <>
              {scenario.slice(0, seg.start)}
              <mark ref={markRef} className={styles.mark}>
                {scenario.slice(seg.start, seg.end)}
              </mark>
              {scenario.slice(seg.end)}
            </>
          ) : (
            scenario
          )}
        </pre>
      </div>
    </aside>
  );
}
