import { useCallback, useEffect, useRef, useState } from 'react';
import type { OutputKey, ScenarioMatch } from '@/lib/types';
import { downloadFile } from '@/lib/download';
import { getActiveScenario } from '@/lib/session';
import { INPUT_FILES, OUTPUT_FILES } from './files';

export type StatusTone = 'idle' | 'busy' | 'ready';

export interface Status {
  text: string;
  tone: StatusTone;
}

/** Scenario text split around the matched span for highlight rendering. */
export interface Highlight {
  before: string;
  match: string;
  after: string;
}

const SEARCH_HIGHLIGHT_MS = 2200;

async function fetchText(path: string): Promise<string> {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Could not load ${path}`);
  return res.text();
}

/**
 * Encapsulates all storyboard-workflow side effects: loading the scenario +
 * generated outputs, running the staged "analysis" animation, computing the
 * scenario highlight, and downloading artifacts. The component stays purely
 * presentational.
 */
export function useStoryboardWorkflow() {
  const [scenarioSource, setScenarioSource] = useState('시나리오 로딩중...');
  const [scenarioMatch, setScenarioMatch] = useState<ScenarioMatch | null>(
    null,
  );
  const [highlight, setHighlight] = useState<Highlight | null>(null);
  const [searching, setSearching] = useState(false);

  // Normally set only by uploading a file. The Motion tab can pre-populate it
  // with a static image URL via the `demoStoryboard` session seed so the
  // workflow can be filmed in an "already uploaded" state.
  const [storyboardPreview, setStoryboardPreview] = useState<string | null>(
    () => sessionStorage.getItem('demoStoryboard'),
  );
  const [status, setStatus] = useState<Status>({
    text: '스토리보드 업로드 준비 완료',
    tone: 'idle',
  });
  const [progress, setProgress] = useState(0);
  const [outputs, setOutputs] = useState({ vectors: '', prompt: '' });
  const [showOutputs, setShowOutputs] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const timers = useRef<number[]>([]);
  const previewUrl = useRef<string | null>(null);

  const pushTimer = (id: number) => timers.current.push(id);

  // Load scenario source + match metadata once.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [scenarioText, matchText] = await Promise.all([
          fetchText(INPUT_FILES.scenario),
          fetchText(INPUT_FILES.match),
        ]);
        if (cancelled) return;
        setScenarioSource(getActiveScenario() || scenarioText);
        setScenarioMatch(JSON.parse(matchText) as ScenarioMatch);
      } catch (error) {
        if (cancelled) return;
        setScenarioSource('Scenario could not be loaded.');
        setStatus({ text: 'Scenario file could not be loaded', tone: 'idle' });
        console.error(error);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Clean up object URLs + timers on unmount.
  useEffect(() => {
    const pendingTimers = timers.current;
    const pendingUrl = previewUrl;
    return () => {
      pendingTimers.forEach(clearTimeout);
      if (pendingUrl.current) URL.revokeObjectURL(pendingUrl.current);
    };
  }, []);

  const computeHighlight = useCallback(() => {
    if (!scenarioMatch || scenarioSource.startsWith('Scenario could not')) {
      return;
    }
    const start = scenarioSource.indexOf(scenarioMatch.highlight_start);
    const end = scenarioSource.indexOf(scenarioMatch.highlight_end, start);
    if (start === -1 || end === -1) {
      setStatus({ text: 'Scenario match could not be found', tone: 'idle' });
      return;
    }
    const matchEnd = end + scenarioMatch.highlight_end.length;
    setHighlight({
      before: scenarioSource.slice(0, start),
      match: scenarioSource.slice(start, matchEnd),
      after: scenarioSource.slice(matchEnd),
    });
    setSearching(true);
    pushTimer(window.setTimeout(() => setSearching(false), SEARCH_HIGHLIGHT_MS));
  }, [scenarioMatch, scenarioSource]);

  const onStoryboardSelected = useCallback(
    (file: File) => {
      if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
      const url = URL.createObjectURL(file);
      previewUrl.current = url;
      setStoryboardPreview(url);
      setShowOutputs(false);
      setProgress(0);
      setStatus({ text: `Searching scenario for ${file.name}`, tone: 'busy' });
      computeHighlight();
    },
    [computeHighlight],
  );

  const runAnalysis = useCallback(async () => {
    setShowOutputs(false);
    setProgress(18);
    setStatus({ text: 'Detecting storyboard panels', tone: 'busy' });
    setAnalyzing(true);

    let loaded: { vectors: string; prompt: string };
    try {
      const [vectors, prompt] = await Promise.all([
        fetchText(OUTPUT_FILES.vectors.path),
        fetchText(OUTPUT_FILES.prompt.path),
      ]);
      loaded = { vectors, prompt };
      setOutputs(loaded);
    } catch (error) {
      setProgress(0);
      setStatus({ text: 'Output files could not be loaded', tone: 'idle' });
      setAnalyzing(false);
      console.error(error);
      return;
    }

    pushTimer(
      window.setTimeout(() => {
        setProgress(58);
        setStatus({ text: 'Extracting motion vectors', tone: 'busy' });
      }, 450),
    );
    pushTimer(
      window.setTimeout(() => {
        setProgress(86);
        setStatus({ text: 'Composing video prompt', tone: 'busy' });
      }, 950),
    );
    pushTimer(
      window.setTimeout(() => {
        setProgress(100);
        setShowOutputs(true);
        setStatus({ text: 'Video AI package ready', tone: 'ready' });
        setAnalyzing(false);
      }, 1450),
    );
  }, []);

  const download = useCallback(
    async (key: OutputKey) => {
      let content = outputs[key];
      if (!content) {
        try {
          content = await fetchText(OUTPUT_FILES[key].path);
          setOutputs((prev) => ({ ...prev, [key]: content }));
        } catch (error) {
          setStatus({ text: 'Output file could not be loaded', tone: 'idle' });
          console.error(error);
          return;
        }
      }
      downloadFile(OUTPUT_FILES[key].filename, content, OUTPUT_FILES[key].type);
    },
    [outputs],
  );

  return {
    scenarioSource,
    highlight,
    scrollBlock: scenarioMatch?.scroll_block ?? 'center',
    searching,
    storyboardPreview,
    status,
    progress,
    outputs,
    showOutputs,
    analyzing,
    setStatus,
    onStoryboardSelected,
    runAnalysis,
    download,
  };
}
