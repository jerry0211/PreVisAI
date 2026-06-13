import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '@/components/AppShell/AppShell';
import { TopBar } from '@/components/TopBar/TopBar';
import { Pill } from '@/components/Pill/Pill';
import { getProjects } from '@/lib/projects';
import { getActiveProjectName, setActiveProjectName } from '@/lib/session';
import { useStoryboardWorkflow } from './useStoryboardWorkflow';
import { ImageIcon, ScriptIcon, PlayIcon } from './icons';
import { ResultView } from './ResultView';
import styles from './StoryboardWorkflowRoute.module.css';

const DEFAULT_TITLE = '스토리보드 → 프롬프트 & 벡터';

export function StoryboardWorkflowRoute() {
  const navigate = useNavigate();
  const wf = useStoryboardWorkflow();

  const [projects] = useState<string[]>(() => getProjects());
  const [activeProject, setActiveProject] = useState<string | null>(() =>
    getActiveProjectName(),
  );
  // Once analysis finishes, the whole screen swaps to the full-page result view.
  const [showResult, setShowResult] = useState(false);
  const markRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (wf.showOutputs) setShowResult(true);
  }, [wf.showOutputs]);

  // Scroll the highlighted span into view when it appears.
  useEffect(() => {
    if (wf.highlight && markRef.current) {
      markRef.current.scrollIntoView({
        block: wf.scrollBlock,
        behavior: 'smooth',
      });
    }
  }, [wf.highlight, wf.scrollBlock]);

  const selectProject = (name: string) => {
    setActiveProject(name);
    setActiveProjectName(name);
    wf.setStatus({ text: `${name} selected`, tone: 'idle' });
  };

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) wf.onStoryboardSelected(file);
  };

  // ----- Full-screen result view (after Generate) -----
  if (showResult) {
    return (
      <AppShell>
        <ResultView
          projectName={activeProject ?? DEFAULT_TITLE}
          storyboardPreview={wf.storyboardPreview}
          onBack={() => setShowResult(false)}
          onHome={() => navigate('/projects')}
        />
      </AppShell>
    );
  }

  const statusClass = [
    styles.statusPill,
    wf.status.tone === 'busy' ? styles.busy : '',
    wf.status.tone === 'ready' ? styles.ready : '',
  ]
    .filter(Boolean)
    .join(' ');

  // ----- Editor view -----
  return (
    <AppShell>
      <TopBar>
        <BrandLink onClick={() => navigate('/projects')} />
        <nav className={styles.topNav}>
          <span className={styles.crumb}>프로젝트 라이브러리</span>
          <span className={styles.crumbSep}>/</span>
          <span className={`${styles.crumb} ${styles.crumbActive}`}>
            {activeProject ?? '스토리보드 워크플로우'}
          </span>
        </nav>
        <div className={styles.topActions}>
          <Pill variant="ghost" size="small" type="button">
            지원 요청
          </Pill>
          <Pill
            variant="ghost"
            size="small"
            type="button"
            aria-label="User profile"
            className={styles.userPill}
          >
            <span className={styles.userDot} aria-hidden="true" />
            User
          </Pill>
        </div>
      </TopBar>

      <div className={styles.layout}>
        <aside className={styles.sidebar} aria-label="projects">
          <div className={styles.sidebarHead}>
            <span className={styles.eyebrow}>프로젝트</span>
            <Pill
              variant="primary"
              size="small"
              type="button"
              onClick={() => navigate('/projects')}
            >
              <span aria-hidden="true">+</span> 새 프로젝트
            </Pill>
          </div>
          <div className={styles.projectList}>
            {projects.map((name) => (
              <button
                key={name}
                type="button"
                className={[
                  styles.projectItem,
                  name === activeProject ? styles.projectItemActive : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                aria-current={name === activeProject ? 'true' : undefined}
                onClick={() => selectProject(name)}
              >
                {name}
              </button>
            ))}
          </div>
        </aside>

        <main className={styles.workflow}>
          <header className={styles.workflowHead}>
            <span className={styles.eyebrow}>스토리보드 워크플로우</span>
            <h1>{activeProject ?? DEFAULT_TITLE}</h1>
            <p className={styles.workflowSub}>
              스토리보드 패널을 업로드하세요. PreVisAI가 시나리오와 비교·분석해
              모션 벡터를 추출하고, 생성 가능한 영상 프롬프트를 완성합니다.
            </p>
            <div className={statusClass}>
              <span className={styles.statusDot} aria-hidden="true" />
              <span>{wf.status.text}</span>
            </div>
          </header>

          <section
            className={styles.cardGrid}
            aria-label="storyboard and scenario"
          >
            <article className={styles.glassCard}>
              <header className={styles.cardHead}>
                <span className={styles.eyebrow}>스토리보드 소스</span>
                <h2>패널 입력</h2>
                <p>PNG, JPG, 혹은 WebP 형식의 스토리보드 이미지를 드롭하세요.</p>
                <span className={styles.cardIcon} aria-hidden="true">
                  <ImageIcon />
                </span>
              </header>
              <label
                className={[
                  styles.uploadDrop,
                  wf.storyboardPreview ? styles.hasImage : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <input type="file" accept="image/*" onChange={handleFile} />
                {wf.storyboardPreview && (
                  <img
                    src={wf.storyboardPreview}
                    alt="Storyboard image preview"
                  />
                )}
                <span className={styles.uploadPrompt}>
                  <span className={styles.uploadIcon} aria-hidden="true">
                    +
                  </span>
                  <strong>스토리보드 이미지 업로드</strong>
                  <small>PNG, JPG, 혹은 WebP — 드래그 & 드롭 가능합니다</small>
                </span>
              </label>
            </article>

            <article className={styles.glassCard}>
              <header className={styles.cardHead}>
                <span className={styles.eyebrow}>시나리오 소스</span>
                <h2>입력된 시나리오</h2>
                <p>스토리보드에 맞는 부분을 하이라이트합니다.</p>
                <span className={styles.cardIcon} aria-hidden="true">
                  <ScriptIcon />
                </span>
              </header>
              <div
                className={[
                  styles.scenarioWindow,
                  wf.searching ? styles.searching : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                aria-label="input scenario"
              >
                <pre>
                  {wf.highlight ? (
                    <>
                      {wf.highlight.before}
                      <mark
                        ref={(el) => (markRef.current = el)}
                        className={styles.scenarioMatch}
                      >
                        {wf.highlight.match}
                      </mark>
                      {wf.highlight.after}
                    </>
                  ) : (
                    wf.scenarioSource
                  )}
                </pre>
              </div>
            </article>
          </section>

          <section className={styles.processRow} aria-label="storyboard actions">
            <div className={styles.processInfo}>
              <span className={styles.eyebrow}>프로세스</span>
              <h2>파이프라인 실행</h2>
              <p>
                패널 감지부터 모션 벡터 추출, 영상 프롬프트 생성까지. 한 번에.
              </p>
            </div>
            <div className={styles.processControls}>
              <div className={styles.actionRow}>
                <Pill
                  variant="primary"
                  type="button"
                  onClick={wf.runAnalysis}
                  disabled={wf.analyzing}
                >
                  <PlayIcon className={styles.pillIcon} />
                  스토리보드 분석
                </Pill>
              </div>
              <div className={styles.progressTrack} aria-hidden="true">
                <span style={{ width: `${wf.progress}%` }} />
              </div>
            </div>
          </section>
        </main>
      </div>
    </AppShell>
  );
}

/** Brand wordmark that triggers an in-app navigation. */
function BrandLink({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      className={styles.brandMini}
      onClick={onClick}
      aria-label="PreVisAI home"
    >
      <img
        className={styles.brandMark}
        src="/assets/favicon.ico"
        alt=""
        aria-hidden="true"
      />
      <span>PreVisAI</span>
    </button>
  );
}
