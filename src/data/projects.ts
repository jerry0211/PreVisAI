/** Seed data for the demo. Real deployments would replace this with an API. */

export const DEFAULT_PROJECTS = [
  'Orbital Witness',
  'Glass Desert',
  'Signal Room',
] as const;

/** Subtitle copy shown on each known project card. */
export const PROJECT_META: Record<string, string> = {
  'Orbital Witness': 'SF 스릴러 · 씬 4개',
  'Glass Desert': '추리 드라마 · 씬 3개',
  'Signal Room': '단편 첩보물 · 씬 2개',
};

export const FALLBACK_PROJECT_META = '시나리오 업로드 완료';
