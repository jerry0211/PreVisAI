import type { ReactNode } from 'react';
import styles from './TopBar.module.css';

interface TopBarProps {
  /** justify-content: 'between' (default) spreads ends; 'start' left-aligns. */
  align?: 'between' | 'start';
  children: ReactNode;
}

/** Sticky, blurred top navigation shell. Pages compose their own contents. */
export function TopBar({ align = 'between', children }: TopBarProps) {
  return (
    <header
      className={[styles.topBar, align === 'start' ? styles.start : '']
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </header>
  );
}
