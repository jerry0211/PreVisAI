import { AppShell } from '@/components/AppShell/AppShell';
import { TopBar } from '@/components/TopBar/TopBar';
import { BrandMini } from '@/components/Brand/BrandMini';
import { Pill } from '@/components/Pill/Pill';
import styles from './NotFoundRoute.module.css';

export function NotFoundRoute() {
  return (
    <AppShell>
      <TopBar align="start">
        <BrandMini withSeparator />
      </TopBar>
      <main className={styles.page}>
        <span className={styles.code}>404</span>
        <h1 className={styles.title}>이 페이지는 아직 촬영 전입니다.</h1>
        <p className={styles.sub}>요청하신 화면을 찾을 수 없습니다.</p>
        <Pill variant="primary" to="/">
          홈으로 돌아가기 <span aria-hidden="true">→</span>
        </Pill>
      </main>
    </AppShell>
  );
}
