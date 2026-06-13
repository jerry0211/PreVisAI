import { useEffect, useMemo, useState } from 'react';
import { TopBar } from '@/components/TopBar/TopBar';
import { BrandMini } from '@/components/Brand/BrandMini';
import { Pill } from '@/components/Pill/Pill';
import { PromptScroller } from './PromptScroller';
import { ScenarioPanel } from './ScenarioPanel';
import { buildPlaceholderPanels } from './scenes';
import styles from './ResultView.module.css';

// Temporary scenario source for the left-hand panel.
const SCENARIO_URL = '/inputs/scenario.txt';

type ResultTab = 'prompt' | 'assets';

interface ResultViewProps {
  projectName: string;
  storyboardPreview: string | null;
  /** Back to the analysis editor. */
  onBack: () => void;
  /** Back to the project library. */
  onHome: () => void;
}

/**
 * Full-screen result view shown after Generate. The top navbar carries two
 * tabs — 프롬프트 (default) and 에셋보드. The asset-board tab is a scaffold for
 * now and will be refined later.
 */
export function ResultView({
  projectName,
  storyboardPreview,
  onBack,
  onHome,
}: ResultViewProps) {
  const [tab, setTab] = useState<ResultTab>('prompt');

  const tabClass = (value: ResultTab) =>
    [styles.tab, tab === value ? styles.tabActive : '']
      .filter(Boolean)
      .join(' ');

  return (
    <>
      <TopBar>
        <BrandMini to="/projects" />
        <nav className={styles.tabs} aria-label="result views">
          <button
            type="button"
            className={tabClass('prompt')}
            aria-current={tab === 'prompt' ? 'page' : undefined}
            onClick={() => setTab('prompt')}
          >
            프롬프트
          </button>
          <button
            type="button"
            className={tabClass('assets')}
            aria-current={tab === 'assets' ? 'page' : undefined}
            onClick={() => setTab('assets')}
          >
            에셋보드
          </button>
        </nav>
        <div className={styles.actions}>
          <Pill variant="ghost" size="small" type="button" onClick={onHome}>
            프로젝트
          </Pill>
          <Pill variant="ghost" size="small" type="button" onClick={onBack}>
            <span aria-hidden="true">←</span> 분석으로
          </Pill>
        </div>
      </TopBar>

      {tab === 'prompt' ? (
        <PromptTab storyboardPreview={storyboardPreview} />
      ) : (
        <main className={styles.main}>
          <header className={styles.head}>
            <span className={styles.eyebrow}>생성 완료</span>
            <h1>{projectName}</h1>
          </header>
          <AssetsTab storyboardPreview={storyboardPreview} />
        </main>
      )}
    </>
  );
}

/* ---------- 프롬프트 tab (default) — scenario + focus scroll list ---------- */
function PromptTab({ storyboardPreview }: { storyboardPreview: string | null }) {
  // Placeholder panels for now — swap with generated per-panel data later.
  const panels = useMemo(() => buildPlaceholderPanels(), []);
  const [active, setActive] = useState(0);
  const [scenario, setScenario] = useState('시나리오 로딩중...');

  useEffect(() => {
    let cancelled = false;
    fetch(SCENARIO_URL)
      .then((res) => res.text())
      .then((text) => {
        if (!cancelled) setScenario(text);
      })
      .catch(() => {
        if (!cancelled) setScenario('시나리오를 불러올 수 없습니다.');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className={styles.promptMain}>
      <div className={styles.promptLayout}>
        <ScenarioPanel
          scenario={scenario}
          count={panels.length}
          active={active}
        />
        <PromptScroller
          panels={panels}
          storyboardPreview={storyboardPreview}
          active={active}
          onActiveChange={setActive}
        />
      </div>
    </main>
  );
}

/* ---------- 에셋보드 tab (scaffold) ---------- */
function AssetsTab({ storyboardPreview }: { storyboardPreview: string | null }) {
  return (
    <section className={styles.assets} aria-label="asset board">
      {storyboardPreview && (
        <img
          className={styles.assetThumb}
          src={storyboardPreview}
          alt="Uploaded storyboard"
        />
      )}
      <div className={styles.assetEmpty}>
        <span className={styles.eyebrow}>에셋보드</span>
        <h2>에셋보드는 곧 추가됩니다</h2>
        <p>이 탭의 디자인은 추후 정의됩니다.</p>
      </div>
    </section>
  );
}
