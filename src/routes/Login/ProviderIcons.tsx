import styles from './LoginRoute.module.css';

/** Google "G" glyph rendered monochrome to match the dark provider buttons. */
export function GoogleIcon() {
  return (
    <svg className={styles.providerIcon} viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#fff"
        d="M17.64 9.2c0-.64-.06-1.25-.17-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.27h2.92a8.78 8.78 0 0 0 2.68-6.63z"
        opacity="0.95"
      />
      <path
        fill="#fff"
        d="M9 18a8.78 8.78 0 0 0 6.04-2.17l-2.93-2.27c-.81.54-1.85.86-3.11.86-2.39 0-4.42-1.62-5.14-3.79H.83v2.38A8.99 8.99 0 0 0 9 18z"
        opacity="0.7"
      />
      <path
        fill="#fff"
        d="M3.86 10.63A5.41 5.41 0 0 1 3.58 9c0-.57.1-1.12.28-1.63V5H.83A8.99 8.99 0 0 0 0 9c0 1.45.35 2.82.83 4z"
        opacity="0.5"
      />
      <path
        fill="#fff"
        d="M9 3.58c1.32 0 2.5.45 3.43 1.34l2.58-2.58A8.95 8.95 0 0 0 9 0 8.99 8.99 0 0 0 .83 5l3.03 2.37C4.58 5.2 6.61 3.58 9 3.58z"
        opacity="0.85"
      />
    </svg>
  );
}

/** Shield glyph for the studio SSO option. */
export function ShieldIcon() {
  return (
    <svg className={styles.providerIcon} viewBox="0 0 18 18" aria-hidden="true">
      <path
        d="M9 1.5l6.5 3v4.7c0 4-2.7 6.6-6.5 7.3-3.8-.7-6.5-3.3-6.5-7.3V4.5L9 1.5z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
      />
    </svg>
  );
}
