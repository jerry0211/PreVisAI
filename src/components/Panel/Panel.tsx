import type { ReactNode } from 'react';
import styles from './Panel.module.css';

interface PanelProps {
  className?: string;
  'aria-label'?: string;
  children: ReactNode;
}

/**
 * Glassy, gradient-bordered card used by the auth + welcome screens. The
 * animated 1px conic border and entrance animation live here so every panel
 * stays visually consistent.
 */
export function Panel({ className, children, ...rest }: PanelProps) {
  return (
    <section
      className={[styles.panel, className ?? ''].filter(Boolean).join(' ')}
      aria-label={rest['aria-label']}
    >
      {children}
    </section>
  );
}
