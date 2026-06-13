import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '@/components/AppShell/AppShell';
import { TopBar } from '@/components/TopBar/TopBar';
import { BrandMini } from '@/components/Brand/BrandMini';
import { Panel } from '@/components/Panel/Panel';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { nameFromEmail } from '@/lib/session';
import { getProjects } from '@/lib/projects';
import styles from './WelcomeRoute.module.css';

const LINGER_MS = 800;

export function WelcomeRoute() {
  const navigate = useNavigate();
  const email = useRequireAuth();
  const [projectCount] = useState(() => getProjects().length);

  useEffect(() => {
    if (!email) return;
    const timer = window.setTimeout(() => navigate('/projects'), LINGER_MS);
    return () => clearTimeout(timer);
  }, [email, navigate]);

  if (!email) return null;

  return (
    <AppShell>
      <TopBar align="start">
        <BrandMini to="/login" withSeparator />
      </TopBar>

      <main className={styles.page}>
        <Panel className={styles.card} aria-label="signed in">
          <div className={styles.orb} aria-hidden="true">
            <span className={styles.orbRing} />
            <span className={styles.orbCore} />
          </div>

          <div className={styles.head}>
            <span className={styles.eyebrow}>로그인 완료</span>
            <h1>
              돌아오신걸 환영합니다,{' '}
              <span className={styles.greeting}>{nameFromEmail(email)}</span>.
            </h1>
            <p>
              프로젝트 라이브러리가 준비되었습니다. 프로젝트 설정 화면으로
              이동합니다.&hellip;
            </p>
          </div>

          <ul className={styles.stats}>
            <li>
              <span className={styles.statLabel}>프로젝트</span>
              <span className={styles.statValue}>{projectCount}개</span>
            </li>
            <li>
              <span className={styles.statLabel}>최근 활동</span>
              <span className={styles.statValue}>2시간 전</span>
            </li>
            <li>
              <span className={styles.statLabel}>플랜</span>
              <span className={styles.statValue}>스튜디오</span>
            </li>
          </ul>

          <div className={styles.redirectTrack} aria-hidden="true">
            <span className={styles.redirectFill} />
          </div>
        </Panel>
      </main>
    </AppShell>
  );
}
