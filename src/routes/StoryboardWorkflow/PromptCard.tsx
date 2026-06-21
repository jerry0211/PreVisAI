import { Pill } from '@/components/Pill/Pill';
import { downloadFile } from '@/lib/download';
import type { ScenePanel } from './scenes';
import styles from './PromptCard.module.css';

interface PromptCardProps {
  panel: ScenePanel;
  /** Full storyboard image — used to fake a per-panel crop until real ones exist. */
  storyboardPreview?: string | null;
  /** Extra class (e.g. the scroller's active/inactive transform). */
  className?: string;
}

/**
 * One prompt panel card: a floating storyboard crop over the combined
 * prompt+vectors JSON, with a header (label + JSON download). Self-contained so
 * it can be reused both in the PromptScroller and in motion-graphics scenes.
 */
export function PromptCard({ panel, storyboardPreview, className }: PromptCardProps) {
  const json = JSON.stringify(panel.data, null, 2);
  return (
    <article className={[styles.card, className].filter(Boolean).join(' ')}>
      <PanelCrop panel={panel} storyboardPreview={storyboardPreview ?? null} />
      <div className={styles.body}>
        <div className={styles.bodyHead}>
          <span className={styles.label}>{panel.label}</span>
          <Pill
            size="small"
            type="button"
            onClick={() =>
              downloadFile(`${panel.id}.json`, json, 'application/json')
            }
          >
            JSON
          </Pill>
        </div>
        <pre className={styles.json}>{json}</pre>
      </div>
    </article>
  );
}

/** Storyboard crop floating over the card. Falls back to the uploaded
 *  storyboard, then a labeled placeholder. */
function PanelCrop({
  panel,
  storyboardPreview,
}: {
  panel: ScenePanel;
  storyboardPreview: string | null;
}) {
  const src = panel.image ?? storyboardPreview;
  if (src) {
    return <img className={styles.cropImg} src={encodeURI(src)} alt={panel.label} />;
  }
  return (
    <div className={styles.cropPlaceholder}>
      <span>스토리보드</span>
    </div>
  );
}
