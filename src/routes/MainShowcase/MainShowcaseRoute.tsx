import { AppShell } from '@/components/AppShell/AppShell';
import { TopBar } from '@/components/TopBar/TopBar';
import { BrandMini } from '@/components/Brand/BrandMini';
import { Pill } from '@/components/Pill/Pill';
import { GENRES, FRAMES, MODELS } from './showcaseData';
import styles from './MainShowcaseRoute.module.css';

/**
 * Unified marketing page. Synthesizes the five "Mainpage" design experiments
 * (cinematic reel, aurora storyboard, neon director, kinetic type, liquid
 * galaxy) into one cohesive, LTX-Studio–inspired landing page driven entirely
 * by the shared design tokens.
 */
export function MainShowcaseRoute() {
  // Duplicated so the marquee can loop seamlessly.
  const marquee = [...GENRES, ...GENRES];

  return (
    <AppShell>
      <div className={styles.aurora} aria-hidden="true">
        <span className={styles.blob1} />
        <span className={styles.blob2} />
        <span className={styles.blob3} />
      </div>

      <TopBar>
        <BrandMini />
        <nav className={styles.nav}>
          <a href="#frames">Studio</a>
          <a href="#models">Models</a>
          <a href="#genres">Reels</a>
        </nav>
        <Pill variant="primary" to="/login">
          Sign In <span aria-hidden="true">→</span>
        </Pill>
      </TopBar>

      <main className={styles.page}>
        {/* ---------- hero ---------- */}
        <section className={styles.hero}>
          <span className={styles.eyebrow}>PreVis Studio · v0.9</span>
          <h1 className={styles.title}>
            Compose the frame
            <br />
            <span className={styles.accent}>before it exists.</span>
          </h1>
          <p className={styles.lede}>
            Storyboard, pre-visualize, and direct multi-model AI cinematography
            from a single slate — built around Sora, Runway, Higgsfield, and
            Kling.
          </p>
          <div className={styles.heroActions}>
            <Pill variant="primary" size="big" to="/login">
              Enter the studio <span aria-hidden="true">→</span>
            </Pill>
            <Pill size="big" to="/projects">
              Browse projects
            </Pill>
          </div>
        </section>

        {/* ---------- genre marquee ---------- */}
        <section id="genres" className={styles.marquee} aria-label="genres">
          <div className={styles.marqueeTrack}>
            {marquee.map((genre, index) => (
              <span key={`${genre}-${index}`} className={styles.genre}>
                {genre}
              </span>
            ))}
          </div>
        </section>

        {/* ---------- storyboard frames ---------- */}
        <section id="frames" className={styles.framesSection}>
          <div className={styles.sectionHead}>
            <span className={styles.eyebrow}>The storyboard table</span>
            <h2>One canvas. Every model.</h2>
            <p>
              Lay out shots, assign each panel to the model that renders it best,
              and keep the whole reel in a single view.
            </p>
          </div>
          <div className={styles.frames}>
            {FRAMES.map((frame) => (
              <article key={frame.scene} className={styles.frame}>
                <div className={styles.thumb} aria-hidden="true" />
                <div className={styles.frameMeta}>
                  <span>{frame.scene}</span>
                  <b>{frame.model}</b>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ---------- model lineup ---------- */}
        <section id="models" className={styles.models}>
          <span className={styles.eyebrow}>Multi-model</span>
          <ul className={styles.modelList}>
            {MODELS.map((model) => (
              <li key={model}>{model}</li>
            ))}
          </ul>
        </section>

        {/* ---------- closing CTA ---------- */}
        <section className={styles.cta}>
          <h2>Roll camera, director.</h2>
          <p>Sign in to your editing bay or claim a fresh production credit.</p>
          <Pill variant="primary" size="big" to="/login">
            Sign In <span aria-hidden="true">→</span>
          </Pill>
        </section>
      </main>
    </AppShell>
  );
}
