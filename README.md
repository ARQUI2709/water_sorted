# Water Sort Puzzle

A water-sort puzzle game built with React + Vite, installable as a PWA and playable offline. Sort the colored liquid between bottles until every bottle holds a single color.

**Play it:** https://arqui2709.github.io/water_sorted/

## Features

- Endless procedurally generated levels — every level is solvable by construction (reverse-pour generation)
- Star rating per level, graded against the optimal solution computed by a BFS solver running in a Web Worker
- Optimal-move hints (solver-backed, with a heuristic fallback on very large levels)
- Three difficulty tiers (empty bottles, undo/hint limits), hidden segments from level 30
- Level map with progress, achievements, streaks, per-level best records
- Color-blind friendly pattern mode, sound and haptic feedback, selectable backgrounds
- Progress stored locally (`localStorage`, namespaced under `wsp:`), with automatic migration from older versions

See [docs/](docs/) for design notes on game mechanics, difficulty scaling and the optimal-movement model.

## Development

Requires Node 22+ and [pnpm](https://pnpm.io/):

```bash
pnpm install
pnpm dev        # dev server
pnpm test       # unit tests (vitest)
pnpm build      # production build into dist/
pnpm preview    # serve the production build (service worker active)
```

The PWA service worker is only generated in the production build — use `pnpm preview` to test offline behavior.

## Deployment

Pushes to `main` run tests, build, and deploy to GitHub Pages via [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). The repository's Pages source must be set to **GitHub Actions** (Settings → Pages).

## Project layout

```
src/
  main.jsx            entry point (storage migration + mount)
  app.jsx             top-level component and game state
  game.js             rules, level generation, hints, layout
  solver.js           BFS solver + star rating (pure, no imports)
  solver.worker.js    Web Worker wrapper around the solver
  storage.js          namespaced localStorage helpers + migration
  constants.js        palette, difficulty tables, backgrounds
  components.jsx      shared UI primitives (Bottle, Legend, …)
  views/              header, board, map, settings, achievements, …
public/assets/        bottle art, backgrounds, icons
docs/                 game design notes and UI mockups
```

## License

[GPL-3.0](LICENSE)
