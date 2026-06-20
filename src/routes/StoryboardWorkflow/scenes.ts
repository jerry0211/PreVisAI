/**
 * Per-panel scene data for the prompt tab's focus list.
 *
 * Each panel pairs a CROP of the full storyboard image with a COMBINED JSON
 * payload holding both the generation prompt and the motion vectors. Right now
 * these are placeholders — to wire real output later, replace `image` with the
 * cropped panel URL and `data` with the generated `{ prompt, vectors }` object.
 * Nothing else in the UI needs to change.
 */

export interface ScenePanel {
  id: string;
  /** Short label shown on the panel, e.g. "Panel 01 · FIX·BCU". */
  label: string;
  /** Cropped storyboard image URL. `null` → fall back to a generated crop. */
  image: string | null;
  /** Combined prompt + vectors payload, rendered as formatted JSON. */
  data: PanelData;
}

export interface PanelData {
  scene: string;
  panel: number;
  shot: string;
  prompt: string;
  vectors: {
    units: string;
    frame_rate: number;
    duration_seconds: number;
    objects: Array<{
      id: string;
      motion: string;
      magnitude: number;
      t: [number, number];
    }>;
  };
}

const SHOTS = [
  'FIX·BCU',
  'Track out + Boom down',
  'FIX·CU',
  'FIX·MS',
  'EXT·LS',
  'Track in',
];

/**
 * Storyboard panel images, in order, from public/outputs/Storyboard Splits.
 * Paths are raw; consumers wrap them with encodeURI() for spaces/Hangul.
 */
const STORYBOARD_IMAGES = [
  '/outputs/Storyboard Splits/스토리보드1.jpg',
  '/outputs/Storyboard Splits/스토리보드2.jpg',
  '/outputs/Storyboard Splits/스토리보드3.jpg',
  '/outputs/Storyboard Splits/스토리보드4.jpg',
  '/outputs/Storyboard Splits/스토리보드5.jpg',
];

/**
 * Build panels from the uploaded storyboard splits (one per image, in order).
 * The combined prompt+vectors JSON is still placeholder until real output
 * exists; only the `data` field needs swapping later.
 */
export function buildPlaceholderPanels(
  count = STORYBOARD_IMAGES.length,
): ScenePanel[] {
  return Array.from({ length: count }, (_, i) => {
    const panel = i + 1;
    const shot = SHOTS[i % SHOTS.length];
    return {
      id: `panel_${String(panel).padStart(2, '0')}`,
      label: `Panel ${String(panel).padStart(2, '0')} · ${shot}`,
      image: STORYBOARD_IMAGES[i] ?? null,
      data: {
        scene: 'scene_03',
        panel,
        shot,
        prompt: `[placeholder] Panel ${panel} — ${shot}. 반지하 거실, 차가운 톤의 흐린 자연광. 실제 생성 프롬프트로 교체될 예정입니다.`,
        vectors: {
          units: 'meters',
          frame_rate: 24,
          duration_seconds: 6 + i,
          objects: [
            {
              id: 'camera',
              motion: i % 2 === 0 ? 'push-in' : 'track-out',
              magnitude: 0.3 + (i % 3) * 0.1,
              t: [0, 1.5],
            },
            {
              id: 'subject',
              motion: 'turn',
              magnitude: 0.2,
              t: [0.5, 2.4],
            },
          ],
        },
      },
    };
  });
}
