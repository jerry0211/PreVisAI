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
      image: '/outputs/Assets/기택.png',
      description:
        '나무 의자에 앉아 컵을 든 중년 남성. 희끗한 짧은 머리, 회색 티셔츠, 옅은 미소. 낡은 벽지와 구형 TV가 있는 반지하 방.',
      prompt:
        'cinematic film still of a middle-aged Korean man with short greying hair and a gentle tired smile, gray t-shirt, sitting on a wooden chair holding a mug, worn semi-basement room with an old CRT TV and soju bottles on a small table, dim overcast light, cold muted tone',
    },
    {
      id: 'char_chung_sook',
      name: '충숙',
      category: 'character',
      image: '/outputs/Assets/충숙.png',
      description:
        '같은 반지하 방에 앉은 40대 여성. 검은 단발, 단단하고 담담한 표정, 회색 티셔츠, 두 손에 컵.',
      prompt:
        'cinematic film still of a 40s Korean woman with a black bob and calm firm expression, gray t-shirt, seated holding a mug in a worn semi-basement room, dim natural light, cold desaturated tone',
    },
    {
      id: 'char_ki_woo',
      name: '기우',
      category: 'character',
      image: '/outputs/Assets/기우.png',
      description: '흰 티셔츠의 20대 청년. 짧은 검은 머리, 옆을 응시하는 차분한 눈빛, 의자에 앉아 컵을 든 모습.',
      prompt:
        'cinematic film still of an early-20s Korean man with short black hair, white t-shirt, glancing to the side with a calm look, seated holding a mug in a dim semi-basement room, cold naturalistic tone',
    },
    {
      id: 'char_ki_jung',
      name: '기정',
      category: 'character',
      image: '/outputs/Assets/기정.png',
      description: '긴 검은 머리의 20대 여성. 어두운 티셔츠, 차분하고 영민한 인상, 같은 반지하 방의 의자.',
      prompt:
        'cinematic film still of a 20s Korean woman with long black hair, dark t-shirt, calm clever gaze, seated holding a mug in the same semi-basement room, cold desaturated tone',
    },
    {
      id: 'loc_semi_basement',
      name: '반지하 거실·부엌',
      category: 'location',
      image: '/outputs/Assets/반지하.jpg',
      description:
        '서울 반지하 집의 거실 겸 부엌. 지면 높이 창으로 행인의 발목이 지나가고, 곳곳에 미접 피자 박스가 쌓임. 우측 싱크대와 낡은 라디에이터, 차갑고 흐린 톤.',
      prompt:
        'wide interior film still of a cramped Seoul semi-basement living room and kitchen, low concrete ceiling, ground-level windows showing the legs of passersby, stacks of flat pizza boxes across the floor, kitchen sink and counter on the right, old radiator, overcast cold daylight, muted palette',
    },
    {
      id: 'obj_pizza_boxes',
      name: '피자 박스 더미',
      category: 'object',
      image: '/outputs/Assets/피자박스.jpg',
      description: '콘크리트 바닥과 팔레트 위에 쌓인 미접 피자 박스 원판 더미. 골판지 질감이 드러나는 클로즈업.',
      prompt:
        'close-up film still of stacks of unfolded flat pizza box blanks piled on a concrete floor and a wooden pallet, corrugated cardboard texture, dim cool industrial light',
    },
    {
      id: 'obj_fumigation_fog',
      name: '소독 연막',
      category: 'object',
      image: '/outputs/Assets/소독 연막.jpg',
      description: '창으로 흘러든 흰 소독 연막이 실내를 가득 메운 장면. 대비가 낮아지고 가구 윤곽이 뿌옇게 흐려짐.',
      prompt:
        'film still of a dim semi-basement interior flooded with white fumigation fog drifting in through the windows, heavy volumetric haze, very low contrast, desaturated cold tone, furniture silhouettes barely visible',
    },
    {
      id: 'style_look',
      name: '룩 & 톤',
      category: 'style',
      image: '/outputs/Assets/컬라 톤.png',
      description: '씬 전체 컬러 팔레트. 음영(Shadow)과 하이라이트(Muted Highlights) 스와치 — 차분한 브라운·슬레이트 블루그레이·머디 그린, 낮은 채도.',
      prompt:
        'scene color palette reference board: muted browns, slate blue-grays and muddy greens arranged as shadow and muted-highlight swatches, low saturation, cold cinematic grade',
    },
  ];
}
