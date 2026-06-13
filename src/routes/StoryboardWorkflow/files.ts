import type { OutputFile, OutputKey } from '@/lib/types';

/** Generated artifacts served from /public/outputs. */
export const OUTPUT_FILES: Record<OutputKey, OutputFile> = {
  vectors: {
    path: '/outputs/scene_vectors.json',
    filename: 'scene_vectors.json',
    type: 'application/json',
  },
  prompt: {
    path: '/outputs/video_prompt.txt',
    filename: 'video_prompt.txt',
    type: 'text/plain',
  },
};

/** Demo inputs served from /public/inputs. */
export const INPUT_FILES = {
  scenario: '/inputs/scenario.txt',
  match: '/inputs/scenario-match.json',
} as const;
