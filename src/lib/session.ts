/**
 * Session-scoped auth + active-project state (sessionStorage), mirroring the
 * original vanilla app. Kept framework-agnostic; React hooks wrap these.
 */

const KEYS = {
  currentUser: 'currentUser',
  projectName: 'projectName',
  projectScenario: 'projectScenario',
} as const;

export function getCurrentUser(): string | null {
  return sessionStorage.getItem(KEYS.currentUser);
}

export function setCurrentUser(email: string): void {
  sessionStorage.setItem(KEYS.currentUser, email);
}

export function clearCurrentUser(): void {
  sessionStorage.removeItem(KEYS.currentUser);
}

export function getActiveProjectName(): string | null {
  return sessionStorage.getItem(KEYS.projectName);
}

export function setActiveProjectName(name: string): void {
  sessionStorage.setItem(KEYS.projectName, name);
}

export function getActiveScenario(): string | null {
  return sessionStorage.getItem(KEYS.projectScenario);
}

export function setActiveScenario(text: string): void {
  sessionStorage.setItem(KEYS.projectScenario, text);
}

/** Derive a friendly display name from an email local-part. */
export function nameFromEmail(email: string | null): string {
  const local = (email ?? '').split('@')[0] ?? '';
  const cleaned = local.replace(/[._-]+/g, ' ').trim();
  if (!cleaned) return 'filmmaker';
  return cleaned.replace(/\b\w/g, (c) => c.toUpperCase());
}
