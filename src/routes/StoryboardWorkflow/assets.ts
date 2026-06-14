/**
 * Asset board data.
 *
 * An "asset" bundles the three things that define a reusable scene element:
 *   - image        : a reference/generated image of the asset
 *   - description  : what it is
 *   - prompt       : the generation prompt used to create the asset image
 * The asset board is the collection of these, auto-extracted from the scene —
 * modeled on LTX Studio's "Elements" (Characters / Locations / Objects / Style).
 *
 * Everything here is placeholder. To wire real output later, replace `image`
 * with a generated URL and fill `description` / `prompt`; the UI relies only on
 * the `Asset` shape.
 */

export type AssetCategory = 'character' | 'location' | 'object' | 'style';

export interface Asset {
  id: string;
  name: string;
  category: AssetCategory;
  /** Reference image URL. `null` → render a placeholder tile. */
  image: string | null;
  description: string;
  /** Prompt used to generate the asset image. */
  prompt: string;
}

export const CATEGORY_LABELS: Record<AssetCategory, string> = {
  character: '캐릭터',
  location: '장소',
  object: '오브젝트',
  style: '스타일',
};

export const CATEGORY_ORDER: AssetCategory[] = [
  'character',
  'location',
  'object',
  'style',
];

/**
 * Build placeholder assets. Swap for real auto-extracted assets later; the
 * board only relies on the `Asset` shape and `CATEGORY_ORDER`.
 */
export function buildPlaceholderAssets(): Asset[] {
  return [
    {
      id: 'char_ki_taek',
      name: '기택',
      category: 'character',
      image: null,
      description:
        '40대 후반 남성, 마른 체형에 짙은 다크서클. 헐렁한 반팔 홈웨어, 불안을 감춘 옅은 미소.',
      prompt:
        '[placeholder] cinematic portrait of a lean late-40s Korean man, tired eyes, gentle forced smile, loose short-sleeve homewear, dim semi-basement light, cold flat tone, film still',
    },
    {
      id: 'char_chung_sook',
      name: '충숙',
      category: 'character',
      image: null,
      description:
        '40대 여성, 단단한 체격과 직설적인 태도. 집안일 도중의 편안한 차림.',
      prompt:
        '[placeholder] cinematic portrait of a sturdy 40s Korean woman, blunt expression, casual housework clothes, semi-basement interior, overcast cold light, film still',
    },
    {
      id: 'char_ki_woo',
      name: '기우',
      category: 'character',
      image: null,
      description: '20대 초반 아들, 조심스럽고 관찰력이 강한 인상.',
      prompt:
        '[placeholder] cinematic portrait of an early-20s Korean man, observant careful look, simple t-shirt, dim apartment, naturalistic cold tone, film still',
    },
    {
      id: 'char_ki_jung',
      name: '기정',
      category: 'character',
      image: null,
      description: '20대 딸, 침착하고 영리한 표정. 무심한 듯한 태도.',
      prompt:
        '[placeholder] cinematic portrait of a 20s Korean woman, calm clever expression, casual outfit, semi-basement light, cold desaturated tone, film still',
    },
    {
      id: 'loc_semi_basement',
      name: '반지하 거실·부엌',
      category: 'location',
      image: null,
      description:
        '서울 반지하 주택의 거실 겸 부엌. 낮은 천장과 지면 높이의 창문, 바닥을 덮은 피자 박스.',
      prompt:
        '[placeholder] wide interior of a cramped Seoul semi-basement apartment, low ceiling, ground-level windows showing ankles of passersby, stacks of pizza boxes on the floor, overcast cold daylight',
    },
    {
      id: 'obj_pizza_boxes',
      name: '피자 박스 더미',
      category: 'object',
      image: null,
      description: '바닥 전체에 산처럼 쌓인 미접 피자 박스 원판.',
      prompt:
        '[placeholder] a mountain of unfolded flat pizza box blanks piled across a floor, worn cardboard texture, dim interior light',
    },
    {
      id: 'obj_fumigation_fog',
      name: '소독 연막',
      category: 'object',
      image: null,
      description: '창문으로 흘러드는 흰 소독 연기. 실내 전체의 대비를 낮춤.',
      prompt:
        '[placeholder] white fumigation fog drifting through a dim apartment interior, volumetric haze, low contrast, scattered light',
    },
    {
      id: 'style_look',
      name: '룩 & 톤',
      category: 'style',
      image: null,
      description: '차갑고 채도가 낮은 반지하 톤. 자연광 기반, 2.39:1 시네마틱 룩.',
      prompt:
        '[placeholder] color grade: cold desaturated palette, low contrast, naturalistic semi-basement lighting, 2.39:1 aspect, subtle film grain',
    },
  ];
}
