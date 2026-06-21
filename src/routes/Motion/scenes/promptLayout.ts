/* Shared layout constants for the prompt-extraction feed card, so multiple
   scenes can place and size the SAME card identically (seamless hand-off).
   Keep in sync with PromptExtractScene.module.css (.stage padding / .feedCol).

   The card is rendered at logical size (cardW × cardH) and scaled down
   (cardScale) to fit the narrow feed. The proportions match the REAL
   PromptScroller card filmed in scene 5 (a row in the ResultView prompt tab —
   the ~720px-wide scroller column × 50vh ≈ 720×360, crop 16vh ≈ 115) so the
   panel-#5 card matches from the feed (scene 3) → focus (scene 4) → real
   scroller (scene 5). */
const CARD_W = 720;
const CARD_H = 360;
const CARD_SCALE = 0.5;

export const PROMPT_LAYOUT = {
  feedW: 380, // .feedCol width
  padX: 32, // .stage left/right padding (--space-8)
  padY: 24, // .stage top/bottom padding (--space-6)
  cardW: CARD_W,
  cardH: CARD_H,
  cardScale: CARD_SCALE,
  slotW: CARD_W * CARD_SCALE, // displayed card width (360)
  slotH: CARD_H * CARD_SCALE, // displayed card height (135)
  cropH: 115, // logical crop tile height inside the card (px, ≈32%)
};
