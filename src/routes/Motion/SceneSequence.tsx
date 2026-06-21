import type { Scene } from './pieces';
import styles from './SceneSequence.module.css';

interface SceneSequenceProps {
  scenes: Scene[];
  /** Global playhead, ms (already looped to the piece's total by the clock). */
  t: number;
}

/**
 * Plays an ordered list of scenes as one continuous flow: it picks the active
 * scene for the current time and renders it with a scene-local clock. Scenes
 * cut seamlessly — no fade between them (each scene owns its own in/out look).
 */
export function SceneSequence({ scenes, t }: SceneSequenceProps) {
  const total = scenes.reduce((sum, s) => sum + s.duration, 0);
  const tt = total > 0 ? ((t % total) + total) % total : 0;

  // Find the active scene + its local time.
  let start = 0;
  let idx = 0;
  for (let i = 0; i < scenes.length; i++) {
    if (tt < start + scenes[i].duration) {
      idx = i;
      break;
    }
    start += scenes[i].duration;
  }
  const localT = tt - start;

  // Render the active scene normally, plus any `preload` scenes kept mounted
  // (hidden) so their heavy resources (iframes) are warm and never reload at the
  // cut. Stable keys = same instances across the whole piece (no remount).
  return (
    <div className={styles.seq}>
      {scenes.map((s, i) => {
        const isActive = i === idx;
        if (!isActive && !s.preload) return null;
        const Scene = s.Component;
        return (
          <div
            key={s.id}
            className={isActive ? styles.layer : styles.preload}
            aria-hidden={isActive ? undefined : true}
          >
            <Scene
              t={isActive ? localT : 0}
              duration={s.duration}
              active={isActive}
            />
          </div>
        );
      })}
    </div>
  );
}
