# PreVisAI

From Script to Shot — an AI pre-visualization studio that turns scenarios and
storyboards into generation-ready prompt packages for Runway, Higgsfield, and
Kling.

This is a **React + TypeScript** single-page app built with **Vite** and
**React Router**.

## Getting started

```bash
npm install
npm run dev      # start the dev server (http://localhost:5173)
npm run build    # type-check + production build to dist/
npm run preview  # preview the production build
npm run lint     # eslint
```

## Project structure

```
public/                 Static assets served as-is
  assets/               Logo, fonts (Pretendard), favicon, intro animation
  inputs/               Demo scenario + match metadata
  outputs/              Generated artifacts (scene_vectors.json, video_prompt.txt)

src/
  app/
    router.tsx          Central route table
  styles/
    tokens.css          ⭐ DESIGN TOKENS — single source of truth for the theme
    global.css          Resets + element base styles
    fonts.css           @font-face + Google font imports
  components/            Reusable UI (AppShell, TopBar, Pill, Panel, Brand…)
  hooks/                 Shared hooks (useRequireAuth)
  lib/                   Framework-agnostic logic (session, projects, download)
  data/                 Seed data (default projects, supported models)
  routes/               One folder per page (component + .module.css + logic)
    Frontpage/          Landing + cinematic intro animation
    Login/              Sign in
    Welcome/            Post-login interstitial
    ProjectSetup/       Project library + scenario upload dialog
    StoryboardWorkflow/ Upload → analyze → prompt & vectors
    MainShowcase/       Unified marketing page (/main)
    NotFound/
```

## Theming

The entire look & feel is driven by CSS custom properties in
[`src/styles/tokens.css`](src/styles/tokens.css). Component styles only
reference those tokens (never raw hex/px), so re-skinning the whole app — colors,
typography, spacing, radii, glows — is a matter of editing that one file. The
default palette is an LTX-Studio–inspired dark, cinematic scheme with a
violet→azure accent spectrum. Change a primitive hue (e.g. `--hue-accent`) and
it cascades everywhere.

## User flow

`/` → `/login` → `/welcome` → `/projects` → `/workflow`

Auth state lives in `sessionStorage`; the project library lives in
`localStorage` (see [`src/lib`](src/lib)).
