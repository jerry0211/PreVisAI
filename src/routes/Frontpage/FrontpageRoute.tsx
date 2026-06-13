import { AppShell } from '@/components/AppShell/AppShell';
import { TopBar } from '@/components/TopBar/TopBar';
import { BrandLogo } from '@/components/Brand/BrandLogo';
import { Pill } from '@/components/Pill/Pill';
import { SUPPORTED_MODELS } from '@/data/models';
import { useIntroSequence } from './useIntroSequence';
import styles from './FrontpageRoute.module.css';

export function FrontpageRoute() {
  const { phase, overlayRef, animRef, brandBlockRef } = useIntroSequence();

  return (
    <AppShell>
      {/* Cinematic intro overlay */}
      <div
        ref={overlayRef}
        data-phase={phase}
        className={[
          styles.introOverlay,
          phase === 'zooming' ? styles.zooming : '',
          phase === 'done' ? styles.done : '',
        ]
          .filter(Boolean)
          .join(' ')}
        aria-hidden="true"
      >
        <div className={styles.introBg} />
        <img ref={animRef} className={styles.introAnim} alt="" />
      </div>

      <TopBar>
        <BrandLogo />
        <Pill variant="primary" to="/login">
          로그인 <span aria-hidden="true">→</span>
        </Pill>
      </TopBar>

      <main
        className={[styles.page, phase === 'intro' ? styles.contentHidden : '']
          .filter(Boolean)
          .join(' ')}
      >
        <section className={styles.hero}>
          <div
            ref={brandBlockRef}
            className={[
              styles.brandBlock,
              phase === 'done' ? styles.brandVisible : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <BrandLogo big />
          </div>

          <div className={styles.heroDivider} aria-hidden="true" />

          <div className={styles.heroGrid}>
            <div className={styles.heroHeadline}>
              <h1>
                From Script
                <br />
                to <span className={styles.accentShot}>Shot.</span>
              </h1>
              <p className={styles.heroSub}>
                <strong>PreVisAI</strong>는 시나리오와 스토리보드를 Runway,
                Higgsfield, Kling에서 바로 쓸 수 있는 생성용 프롬프트 패키지로
                바꿔줍니다. 눈 깜짝할 사이에.
              </p>
            </div>
          </div>

          <footer className={styles.heroFoot}>
            <span className={styles.supportedLabel}>
              <span className={styles.dot} aria-hidden="true" /> 지원 모델
            </span>
            <ul className={styles.modelList}>
              {SUPPORTED_MODELS.map((model) => (
                <li key={model}>{model}</li>
              ))}
            </ul>
          </footer>
        </section>
      </main>
    </AppShell>
  );
}
