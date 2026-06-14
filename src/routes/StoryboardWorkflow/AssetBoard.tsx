import { useMemo } from 'react';
import { Pill } from '@/components/Pill/Pill';
import {
  buildPlaceholderAssets,
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  type Asset,
} from './assets';
import styles from './AssetBoard.module.css';

/**
 * Asset board — the collection of assets (image + description + generation
 * prompt) auto-extracted from the scene, grouped by category. Data is
 * placeholder for now; cards render a placeholder tile when an asset has no
 * image yet.
 */
export function AssetBoard() {
  const assets = useMemo(() => buildPlaceholderAssets(), []);

  const groups = CATEGORY_ORDER.map((category) => ({
    category,
    items: assets.filter((a) => a.category === category),
  })).filter((group) => group.items.length > 0);

  return (
    <div className={styles.board}>
      <p className={styles.summary}>
        이 씬에서 자동 추출된 에셋 <strong>{assets.length}개</strong> · 각 에셋은
        이미지 · 설명 · 생성 프롬프트로 구성됩니다.
      </p>

      {groups.map((group) => (
        <section key={group.category} className={styles.group}>
          <header className={styles.groupHead}>
            <h2>{CATEGORY_LABELS[group.category]}</h2>
            <span className={styles.count}>{group.items.length}</span>
          </header>
          <div className={styles.grid}>
            {group.items.map((asset) => (
              <AssetCard key={asset.id} asset={asset} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function AssetCard({ asset }: { asset: Asset }) {
  const copyPrompt = () => {
    void navigator.clipboard?.writeText(asset.prompt);
  };

  return (
    <article className={styles.card}>
      <div className={styles.thumb}>
        {asset.image ? (
          <img
            className={styles.thumbImg}
            src={asset.image}
            alt={asset.name}
          />
        ) : (
          <>
            <span className={styles.placeholderTag}>PLACEHOLDER</span>
            <span className={styles.glyph} aria-hidden="true">
              {asset.name.slice(0, 1)}
            </span>
          </>
        )}
      </div>

      <div className={styles.body}>
        <div className={styles.top}>
          <span className={styles.badge}>{CATEGORY_LABELS[asset.category]}</span>
          <h3 className={styles.name}>{asset.name}</h3>
        </div>
        <p className={styles.desc}>{asset.description}</p>

        <div className={styles.promptBlock}>
          <div className={styles.promptHead}>
            <span className={styles.promptLabel}>생성 프롬프트</span>
            <Pill size="small" type="button" onClick={copyPrompt}>
              복사
            </Pill>
          </div>
          <pre className={styles.prompt}>{asset.prompt}</pre>
        </div>
      </div>
    </article>
  );
}
