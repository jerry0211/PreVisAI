import { Link } from 'react-router-dom';
import { AppShell } from '@/components/AppShell/AppShell';
import { TopBar } from '@/components/TopBar/TopBar';
import { BrandMini } from '@/components/Brand/BrandMini';
import { Pill } from '@/components/Pill/Pill';
import { MOTION_PIECES, pieceDuration } from './pieces';
import { formatTime } from './timeline';
import styles from './MotionGalleryRoute.module.css';

/**
 * Index of the Motion tab — every advertising motion graphic for PreVisAI is
 * listed here, each linking to its own player sub-route (/motion/:id). New
 * pieces appear automatically as they are added to the registry.
 */
export function MotionGalleryRoute() {
  return (
    <AppShell>
      <TopBar>
        <BrandMini withSeparator />
        <span className={styles.crumb}>모션 그래픽</span>
        <Pill variant="ghost" size="small" to="/main">
          사이트 보기
        </Pill>
      </TopBar>

      <main className={styles.page}>
        <header className={styles.head}>
          <span className={styles.eyebrow}>Motion · 광고 모션 그래픽</span>
          <h1>PreVisAI를 움직이게.</h1>
          <p className={styles.lead}>
            실제 제품 화면을 카메라가 클로즈업으로 훑는, 광고용 모션 그래픽
            모음입니다. 각 작품을 골라 재생하고, 타임라인을 직접 스크럽해
            보세요.
          </p>
        </header>

        <section className={styles.grid} aria-label="motion pieces">
          {MOTION_PIECES.map((piece, i) => (
            <Link
              key={piece.id}
              to={`/motion/${piece.id}`}
              className={styles.card}
            >
              <div className={styles.thumb} aria-hidden="true">
                <span className={styles.thumbIndex}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className={styles.playGlyph}>▶</span>
              </div>
              <div className={styles.cardBody}>
                <div className={styles.cardMeta}>
                  <span className={styles.duration}>
                    {formatTime(pieceDuration(piece))}
                  </span>
                  <span className={styles.filming}>films {piece.src}</span>
                </div>
                <h2 className={styles.cardTitle}>{piece.title}</h2>
                <p className={styles.cardTag}>{piece.tagline}</p>
              </div>
            </Link>
          ))}
        </section>
      </main>
    </AppShell>
  );
}
