# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # dev server (http://localhost:5173/water_sorted/)
pnpm build        # production build → dist/
pnpm preview      # preview build with active service worker
pnpm test         # run all tests (Vitest)
```

Run a single test file:
```bash
pnpm vitest run src/game.test.js
```

## Architecture

**Water Sort Puzzle** — a React + Vite PWA where players sort colored liquid between bottles.

### Layer diagram

```
app.jsx  ←→  game.js            Level generation, move validation, win/deadlock detection
         ←→  solver.js          BFS optimal-move solver (pure module, no side effects)
         ←→  solver.worker.js   Web Worker wrapper — solver runs off the main thread
         ←→  storage.js         Namespaced localStorage (all keys prefixed wsp:)
         ←→  audio.js           Web Audio synthesis + navigator.vibrate haptics
         ←→  constants.js       Design tokens (UI.*), palettes, difficulty tables, fonts

app.jsx renders:
  views/home.jsx          title screen + nav buttons
  views/header.jsx        top bar (level, moves, timer, difficulty dot)
  views/game-board.jsx    bottle grid + deadlock warning
  views/controls.jsx      Undo / Hint / Retry / Skip bar
  views/win-screen.jsx    victory overlay with confetti
  views/map.jsx           4-column level selector grid
  views/settings.jsx      difficulty / background / preferences modal
  views/achievements.jsx  milestone tracker
  views/tutorial.jsx      first-run carousel
  components/chrome.jsx   shared primitives: IconButton, ModalCard, FullScreenPanel, Toast
  components.jsx          Bottle, Legend, Stars, Confetti (game-specific primitives)
```

### State ownership

`app.jsx` is the sole state container. Every view is presentational — it receives props and calls callbacks. No context, no external store.

Key state buckets in App:
- **Game state:** `level`, `maxLevel`, `bottles[]`, `revealed[]`, `moves`, `history[]`, `selected`
- **Solver state:** `mopt` (exact optimal; -1 = unknown), `moptLB` (lower-bound fallback), `stars`, `deadlock`
- **UI toggles:** `showHome`, `showMap`, `showWin`, etc.
- **Preferences:** `difficulty`, `muted`, `patMode`, `backgroundId`, `hintsLeft`, `undosLeft`
- **Worker refs:** `workerRef`, `solveIdRef`, `levelSeqRef` — `levelSeqRef` discards stale async solver results

### Level generation

`game.js → generateLevel(level, tier)` builds levels by reverse-simulation: start from a solved state, apply random reverse-pours. This guarantees every level is solvable by construction. `hiddenCount` (levels 30+) hides some bottle segments, revealed progressively as pours land.

### Solver

`solver.js → solveBFS` runs a BFS capped at 300k nodes / 4s. Result is posted via `solver.worker.js`. When the solver times out, `movesLowerBound()` provides a conservative lower bound so star-grading is never impossible. Star thresholds: ≤ `ceil(0.10 * Mopt) + 2` extra moves → 3★, ≤ `ceil(0.25 * Mopt) + 5` → 2★, else 1★.

### Storage

`storage.js` — all keys namespaced `wsp:`. One-time `migrateStorage()` runs at startup (before React mounts in `main.jsx`) to port legacy keys. Per-level best moves/stars stored as `wb{n}` / `wstar{n}`.

### Design tokens

All visual constants live in `constants.js → UI`. Use `UI.surface`, `UI.text`, `UI.accent`, `UI.radius`, `UI.font`, `UI.z` for any new UI. Fonts are `FONTS.default` (Rajdhani) and `FONTS.orbitron` (Orbitron). Never hardcode color values or z-indexes.

### Key behaviors to preserve

- `difficultyRef` is read at level-generation time; changing difficulty mid-game takes effect on the **next** level.
- `levelSeqRef` increments each time a new level is loaded; the worker response handler drops results with a mismatched seq.
- Streak resets when the player jumps to a non-adjacent level via the map or hits Retry.
- `pnpm preview` (not `dev`) activates the service worker — test PWA/offline behavior there.

## Testing

Tests live alongside sources: `game.test.js`, `solver.test.js`, `storage.test.js`, `app.test.jsx`. Vitest is the runner; no separate config file (configured in `vite.config.js`). The solver tests can be slow (~several seconds) due to BFS execution.

## Deployment

GitHub Actions (`.github/workflows/deploy.yml`) runs `pnpm test && pnpm build` on push to `main`, then deploys `dist/` to GitHub Pages at `arqui2709.github.io/water_sorted/`. The Vite `base` is set to `/water_sorted/` — all asset paths are relative to that prefix.
