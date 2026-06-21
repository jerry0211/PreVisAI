import { useEffect, useState } from 'react';
import { AppShell } from '@/components/AppShell/AppShell';
import { ResultView } from '@/routes/StoryboardWorkflow/ResultView';

/**
 * The real result page (ResultView) as a film set for the Motion tab's scene 5.
 * Its prompt tab is the PromptScroller with its built-in bottom→top intro.
 *
 * Scene 5 preloads this iframe and posts `previs:replay` when it becomes active;
 * we remount ResultView (key bump) so the intro plays again on cue, without
 * reloading the iframe (no black flash).
 */
const noop = () => {};

export function PromptFilmRoute() {
  const [introKey, setIntroKey] = useState(0);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.data === 'previs:replay') setIntroKey((k) => k + 1);
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  return (
    <AppShell>
      <ResultView
        key={introKey}
        projectName="Parasite"
        storyboardPreview={null}
        onBack={noop}
        onHome={noop}
      />
    </AppShell>
  );
}
