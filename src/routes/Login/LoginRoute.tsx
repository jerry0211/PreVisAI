import { useRef, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '@/components/AppShell/AppShell';
import { TopBar } from '@/components/TopBar/TopBar';
import { BrandMini } from '@/components/Brand/BrandMini';
import { Panel } from '@/components/Panel/Panel';
import { Pill } from '@/components/Pill/Pill';
import { setCurrentUser } from '@/lib/session';
import { GoogleIcon, ShieldIcon } from './ProviderIcons';
import styles from './LoginRoute.module.css';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;
const REDIRECT_DELAY_MS = 500;

export function LoginRoute() {
  const navigate = useNavigate();
  const formRef = useRef<HTMLFormElement>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [loading, setLoading] = useState(false);

  const isFormValid = () =>
    EMAIL_REGEX.test(email.trim()) && password.length >= MIN_PASSWORD_LENGTH;

  const handleSignIn = (event: FormEvent) => {
    event.preventDefault();

    if (!isFormValid()) {
      setShowHint(true);
      formRef.current?.reportValidity();
      return;
    }

    setShowHint(false);
    setLoading(true);
    setCurrentUser(email.trim());
    window.setTimeout(() => navigate('/welcome'), REDIRECT_DELAY_MS);
  };

  return (
    <AppShell>
      <TopBar align="start">
        <BrandMini withSeparator />
      </TopBar>

      <main className={styles.page}>
        <Panel aria-label="sign in">
          <div className={styles.brand}>
            <img
              className={styles.brandMark}
              src="/assets/favicon.ico"
              alt=""
              aria-hidden="true"
            />
            <span className={styles.brandWord}>PreVisAI</span>
          </div>

          <div className={styles.head}>
            <span className={styles.eyebrow}>환영합니다</span>
            <h1>스튜디오로 로그인</h1>
            <p className={styles.sub}>
              이전 작업을 이어서 진행하거나, Runway, Higgsfield, Kling용 새 PreVis
              프로젝트를 시작하세요.
            </p>
          </div>

          <form
            ref={formRef}
            className={styles.form}
            onSubmit={handleSignIn}
            autoComplete="on"
          >
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Email</span>
              <input
                type="email"
                placeholder="you@studio.com"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setShowHint(false);
                }}
              />
            </label>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Password</span>
              <input
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                minLength={MIN_PASSWORD_LENGTH}
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setShowHint(false);
                }}
              />
            </label>

            <div className={styles.row}>
              <label className={styles.check}>
                <input type="checkbox" defaultChecked />
                <span>이 디바이스에서 사용자를 기억하기</span>
              </label>
              <a className={styles.link} href="#">
                비밀번호를 잊으셨습니까?
              </a>
            </div>

            <div className={styles.actions}>
              <Pill
                variant="primary"
                size="big"
                type="submit"
                disabled={loading}
                className={styles.signInButton}
              >
                {loading ? (
                  <span className={styles.spinner} aria-hidden="true" />
                ) : (
                  <>
                    <span>Continue</span>
                    <span aria-hidden="true">→</span>
                  </>
                )}
              </Pill>
              {showHint && (
                <p className={styles.hint}>
                  유효한 이메일 주소와 6자 이상의 비밀번호를 입력하세요.
                </p>
              )}
            </div>
          </form>

          <div className={styles.divider} aria-hidden="true">
            <span>or</span>
          </div>

          <div className={styles.providers}>
            <Pill type="button">
              <GoogleIcon />
              Continue with Google
            </Pill>
            <Pill type="button">
              <ShieldIcon />
              스튜디오 SSO
            </Pill>
          </div>

          <p className={styles.foot}>
            PreVisAI가 처음이신가요?{' '}
            <a className={styles.link} href="#">
              회원 가입
            </a>
          </p>
        </Panel>
      </main>
    </AppShell>
  );
}
