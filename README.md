# PreVisAI

From Script to Shot — an AI pre-visualization studio that turns scenarios and
storyboards into generation-ready prompt packages for Runway, Higgsfield, and
Kling.

This is a **React + TypeScript** single-page app built with **Vite** and
**React Router**. The UI is largely Korean.

## Getting started

```bash
npm install
npm run dev      # start the dev server (http://localhost:5173, auto-bumps if busy)
npm run build    # type-check + production build to dist/
npm run preview  # preview the production build
npm run lint     # eslint
npm run format   # prettier
```

## Project structure

```
public/                 Static assets served as-is
  assets/               Logo, fonts (Pretendard, Paperlogy), favicon, intro animation
  inputs/               Demo scenario + match metadata
  outputs/              Generated artifacts (scene_vectors.json, video_prompt.txt),
                        plus Assets/ and Storyboard Splits/ demo imagery

src/
  app/
    router.tsx          Central route table
  styles/
    tokens.css          ⭐ DESIGN TOKENS — single source of truth for the theme
    global.css          Resets + element base styles
    fonts.css           @font-face + Google font imports
  components/            Reusable UI (AppShell, AppBackground, TopBar, Pill, Panel, Brand…)
  hooks/                 Shared hooks (useRequireAuth)
  lib/                   Framework-agnostic logic (session, projects, download, types)
  data/                 Seed data (default projects, supported models)
  routes/               One folder per page (component + .module.css + logic)
    Frontpage/          Landing + cinematic intro animation (useIntroSequence)
    Login/              Sign in (provider icons)
    Welcome/            Post-login interstitial
    ProjectSetup/       Project library + scenario upload dialog (ScenarioDialog)
    StoryboardWorkflow/ Upload → analyze → prompts & vectors → full-page result
    MainShowcase/       Unified marketing page (/main)
    Motion/             Internal Motion tab — advertising motion graphics (/motion)
    NotFound/
```

### StoryboardWorkflow

The core product screen. `StoryboardWorkflowRoute` hosts the editor (project
sidebar, storyboard upload, scenario panel, run controls); the analysis flow
lives in the `useStoryboardWorkflow` hook, and once it finishes the screen swaps
to the full-page `ResultView`. Supporting pieces: `AssetBoard`,
`PromptScroller` (per-panel prompt + motion-vector JSON), `ScenarioPanel`,
`scenes.ts` / `assets.ts` / `files.ts` (demo data + loaders), and `icons.tsx`.

### Motion tab (`/motion`)

Internal tab for building **advertising motion graphics** — every file lives
under [`src/routes/Motion/`](src/routes/Motion). Rather than abstract animation,
each piece *films the real product*: the target route renders inside an isolated
iframe and a virtual camera zooms in tight to crop just the element that matters
at each moment, gliding between them (the full page is almost never shown).

- `/motion` — gallery listing every piece.
- `/motion/:pieceId` — player with play/pause, restart, scrubber, and fullscreen.
- [`CameraStage.tsx`](src/routes/Motion/CameraStage.tsx) — the iframe camera
  (measures live element rects, frames them to 16:9, eases pan/zoom + push-in drift).
- [`timeline.ts`](src/routes/Motion/timeline.ts) / [`useMotionClock.ts`](src/routes/Motion/useMotionClock.ts)
  — a single looping playhead; pieces are pure functions of time, so
  scrubbing/pause come for free.
- [`pieces.ts`](src/routes/Motion/pieces.ts) — the registry. Add an ad by
  appending a piece and its shot list; shots target stable `aria-label`/semantic
  selectors (CSS-module classes are hashed and unstable).

## Theming

The entire look & feel is driven by CSS custom properties in
[`src/styles/tokens.css`](src/styles/tokens.css). Component styles only
reference those tokens (never raw hex/px), so re-skinning the whole app — colors,
typography, spacing, radii, glows — is a matter of editing that one file. The
default palette is LTX-Studio–inspired: a near-monochrome warm-dark canvas with
a single vibrant **imperial-red** accent reserved for CTAs, links, and active
states. Change a primitive hue (e.g. `--hue-accent`) and it cascades everywhere.

## Routes & user flow

Product flow: `/` → `/login` → `/welcome` → `/projects` → `/workflow`

Additional routes: `/main` (marketing showcase) and `/motion` (internal motion
graphics tab).

Auth state lives in `sessionStorage`; the project library lives in
`localStorage` (see [`src/lib`](src/lib)).
