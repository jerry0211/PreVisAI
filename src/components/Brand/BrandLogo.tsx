import styles from './Brand.module.css';

const LOGO = '/assets/PreVisAI_logo_transparent.png';

interface BrandLogoProps {
  /** Render the oversized hero variant. */
  big?: boolean;
  className?: string;
}

/** The full PreVisAI logo lockup. */
export function BrandLogo({ big = false, className }: BrandLogoProps) {
  return (
    <img
      className={[styles.logo, big ? styles.logoBig : '', className ?? '']
        .filter(Boolean)
        .join(' ')}
      src={LOGO}
      alt="PreVisAI"
    />
  );
}
