import { useRef, type ChangeEvent } from 'react';
import { useParams } from 'react-router-dom';
import { AppShell } from '@/components/AppShell/AppShell';
import { TopBar } from '@/components/TopBar/TopBar';
import { BrandMini } from '@/components/Brand/BrandMini';
import { Pill } from '@/components/Pill/Pill';
import { SceneSequence } from './SceneSequence';
import { findPiece, pieceDuration } from './pieces';
import { useMotionClock } from './useMotionClock';
import { formatTime } from './timeline';
import { NotFoundRoute } from '@/routes/NotFound/NotFoundRoute';
import styles from './MotionPlayerRoute.module.css';

/** Plays a single motion graphic at /motion/:pieceId with transport controls. */
export function MotionPlayerRoute() {
  const { pieceId } = useParams();
  const piece = findPiece(pieceId);

  if (!piece) return <NotFoundRoute />;
  return <Player key={piece.id} />;
}

/** Split out so the clock's `duration` is fixed per piece (keyed remount). */
function Player() {
  const { pieceId } = useParams();
  const piece = findPiece(pieceId)!;
  const duration = pieceDuration(piece);
  const clock = useMotionClock(duration);
  const stageRef = useRef<HTMLDivElement>(null);

  const onScrub = (e: ChangeEvent<HTMLInputElement>) =>
    clock.seek(Number(e.target.value));

  const toggleFullscreen = () => {
    const el = stageRef.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else el.requestFullscreen?.();
  };

  return (
    <AppShell>
      <TopBar>
        <BrandMini withSeparator />
        <nav className={styles.nav}>
          <Pill variant="ghost" size="small" to="/motion">
            <span aria-hidden="true">←</span> 모션 갤러리
          </Pill>
          <span className={styles.title}>{piece.title}</span>
        </nav>
        <span className={styles.sceneCount}>{piece.scenes.length}개 씬</span>
      </TopBar>

      <main className={styles.page}>
        <div ref={stageRef} className={styles.stageWrap}>
          <SceneSequence scenes={piece.scenes} t={clock.t} />
        </div>

        <div className={styles.controls}>
          <button
            type="button"
            className={styles.transport}
            onClick={clock.toggle}
            aria-label={clock.playing ? '일시정지' : '재생'}
          >
            {clock.playing ? '❚❚' : '▶'}
          </button>
          <button
            type="button"
            className={styles.transportGhost}
            onClick={clock.restart}
            aria-label="처음부터"
          >
            ↺
          </button>

          <input
            className={styles.scrub}
            type="range"
            min={0}
            max={duration}
            step={16}
            value={clock.t}
            onChange={onScrub}
            aria-label="타임라인"
            style={{ ['--p' as string]: `${(clock.t / duration) * 100}%` }}
          />

          <span className={styles.time}>
            {formatTime(clock.t)} / {formatTime(duration)}
          </span>

          <button
            type="button"
            className={styles.transportGhost}
            onClick={toggleFullscreen}
            aria-label="전체화면"
          >
            ⛶
          </button>
        </div>

        <section className={styles.about}>
          <h1 className={styles.aboutTitle}>{piece.title}</h1>
          <p className={styles.aboutText}>{piece.description}</p>
          <ul className={styles.shotList}>
            {piece.scenes.map((s, i) => (
              <li key={s.id}>
                <span className={styles.shotNum}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                {s.title}
              </li>
            ))}
          </ul>
        </section>
      </main>
    </AppShell>
  );
}
