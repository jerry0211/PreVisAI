/** Shared domain types for PreVisAI. */

export interface ProjectMeta {
  /** Short human descriptor, e.g. "SF 스릴러 · 씬 4개". */
  description: string;
}

/** The two generated artifacts the workflow can download. */
export type OutputKey = 'vectors' | 'prompt';

export interface OutputFile {
  path: string;
  filename: string;
  type: string;
}

/** Shape of public/inputs/scenario-match.json. */
export interface ScenarioMatch {
  highlight_start: string;
  highlight_end: string;
  scroll_block?: ScrollLogicalPosition;
}
