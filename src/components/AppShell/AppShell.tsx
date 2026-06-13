import type { ReactNode } from 'react';
import { AppBackground } from '@/components/AppBackground/AppBackground';

interface AppShellProps {
  children: ReactNode;
}

/**
 * Wraps every route with the shared ambient background. Kept intentionally
 * thin so individual pages own their own header/main layout.
 */
export function AppShell({ children }: AppShellProps) {
  return (
    <>
      <AppBackground />
      {children}
    </>
  );
}
