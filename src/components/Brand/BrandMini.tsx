import { Link } from 'react-router-dom';
import styles from './Brand.module.css';

const FAVICON = '/assets/favicon.ico';

interface BrandMiniProps {
  /** Where the wordmark links to. Defaults to the home/front page. */
  to?: string;
  /** Show a trailing "/" deck separator (used by interior pages). */
  withSeparator?: boolean;
}

/** Compact favicon + "PreVisAI" wordmark used in interior top bars. */
export function BrandMini({ to = '/', withSeparator = false }: BrandMiniProps) {
  const link = (
    <Link className={styles.brandMini} to={to} aria-label="PreVisAI home">
      <img className={styles.mark} src={FAVICON} alt="" aria-hidden="true" />
      <span>PreVisAI</span>
    </Link>
  );

  if (!withSeparator) return link;

  return (
    <div className={styles.deckTag}>
      {link}
      <span className={styles.tagSep}>/</span>
    </div>
  );
}
