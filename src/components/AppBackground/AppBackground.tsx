import styles from './AppBackground.module.css';

/** Fixed ambient accent glow that sits behind every page. */
export function AppBackground() {
  return <div className={styles.glow} aria-hidden="true" />;
}
