import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '@/components/AppShell/AppShell';
import { TopBar } from '@/components/TopBar/TopBar';
import { BrandMini } from '@/components/Brand/BrandMini';
import { addProject, getProjects } from '@/lib/projects';
import { setActiveProjectName, setActiveScenario } from '@/lib/session';
import { PROJECT_META, FALLBACK_PROJECT_META } from '@/data/projects';
import { ScenarioDialog } from './ScenarioDialog';
import styles from './ProjectSetupRoute.module.css';

export function ProjectSetupRoute() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<string[]>(() => getProjects());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogName, setDialogName] = useState('');

  const openDialog = (name = '') => {
    setDialogName(name);
    setDialogOpen(true);
  };

  const handleContinue = (name: string, scenario: string) => {
    const finalName = name.trim() || 'Untitled Project';
    setProjects(addProject(finalName));
    setActiveProjectName(finalName);
    setActiveScenario(scenario);
    navigate('/workflow');
  };

  return (
    <AppShell>
      <TopBar align="start">
        <BrandMini withSeparator />
      </TopBar>

      <main className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.brandBlock}>
            <img
              className={styles.brandMark}
              src="/assets/favicon.ico"
              alt=""
              aria-hidden="true"
            />
            <span className={styles.brandWord}>PreVisAI</span>
          </div>
          <div className={styles.heroDivider} aria-hidden="true" />
        </section>

        <section className={styles.projects} aria-label="projects">
          <div className={styles.sectionHead}>
            <span className={styles.eyebrow}>프로젝트 라이브러리</span>
            <h2>프로젝트</h2>
            <p className={styles.sectionSub}>
              각 프로젝트는 내장된 시나리오를 바탕으로 스토리보드를 업로드 할 때
              마다 해당 부분의 프롬프트와 벡터 리스트를 생성합니다.
            </p>
          </div>

          <div className={styles.projectGrid}>
            {projects.map((name) => (
              <button
                key={name}
                type="button"
                className={styles.projectCard}
                onClick={() => openDialog(name)}
              >
                <span className={styles.projectEyebrow}>프로젝트</span>
                <span className={styles.projectTitle}>{name}</span>
                <span className={styles.projectFoot}>
                  <span>{PROJECT_META[name] ?? FALLBACK_PROJECT_META}</span>
                  <span className={styles.projectArrow}>→</span>
                </span>
              </button>
            ))}
          </div>

          <button
            type="button"
            className={styles.newProjectCard}
            onClick={() => openDialog()}
          >
            <span className={styles.plus} aria-hidden="true">
              +
            </span>
            <span className={styles.newProjectText}>
              <strong>새 프로젝트</strong>
              <small>전체 시나리오를 업로드하세요.</small>
            </span>
          </button>
        </section>
      </main>

      <ScenarioDialog
        open={dialogOpen}
        initialName={dialogName}
        onClose={() => setDialogOpen(false)}
        onContinue={handleContinue}
      />
    </AppShell>
  );
}
