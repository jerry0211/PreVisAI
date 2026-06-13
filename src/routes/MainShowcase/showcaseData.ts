/** Content for the unified marketing/showcase page, distilled from the five
 *  Mainpage design experiments into one cohesive narrative. */

export const GENRES = [
  'Sci-Fi',
  'Western',
  'Noir',
  'Romance',
  'Anime',
  'Documentary',
  'Thriller',
  'Fantasy',
] as const;

export interface StoryboardFrame {
  scene: string;
  model: string;
}

export const FRAMES: StoryboardFrame[] = [
  { scene: 'SCN 12 · Wide', model: 'Sora' },
  { scene: 'SCN 04 · OTS', model: 'Runway' },
  { scene: 'SCN 22 · Push-In', model: 'Kling' },
  { scene: 'SCN 08 · Pan', model: 'Higgsfield' },
];

export const MODELS = ['Sora', 'Runway', 'Higgsfield', 'Kling'] as const;
