// ============================================
// SOLVER — BFS for optimal moves + star rating
// ============================================
//
// Pure module with zero imports: it is shared by the solver Web Worker
// and the unit tests, so it must not pull in DOM or React dependencies.

// Canonical state key: sort bottles as strings for dedup
// (handles bottle-permutation symmetry + empty-bottle equivalence)
function _solverKey(state) {
  return state.map(b => b.join(',')).sort().join('|');
}

// Check if every bottle is empty or full with one color
function _solverIsSolved(state, cap) {
  for (const b of state) {
    if (b.length === 0) continue;
    if (b.length !== cap) return false;
    for (let i = 1; i < b.length; i++) {
      if (b[i] !== b[0]) return false;
    }
  }
  return true;
}

// Count of consecutive same-color segments from the top
function _solverTopRun(b) {
  if (!b.length) return 0;
  const c = b[b.length - 1];
  let k = 0;
  for (let i = b.length - 1; i >= 0; i--) {
    if (b[i] !== c) break;
    k++;
  }
  return k;
}

/**
 * Lower bound on the number of moves needed to solve a state.
 *
 * Every pour merges at most one maximal same-color run into another, so the
 * total run count drops by at most 1 per move; the solved state has exactly
 * one run per color. Used as a stand-in for Mopt when the solver cannot
 * finish within budget — it never overestimates, so star thresholds derived
 * from it are at worst slightly stricter than the true ones.
 */
export function movesLowerBound(bottles) {
  const colors = new Set();
  let runs = 0;
  for (const b of bottles) {
    for (let i = 0; i < b.length; i++) {
      colors.add(b[i]);
      if (i === 0 || b[i] !== b[i - 1]) runs++;
    }
  }
  return Math.max(0, runs - colors.size);
}

/**
 * BFS solver. Runs inside a Web Worker, so it may block for up to
 * `timeLimitMs` without affecting the UI.
 *
 * Returns:
 * - { status: 'solved', moves, firstMove: { from, to } } — optimal length
 *   and the first move of one optimal solution (used for hints).
 * - { status: 'unsolvable' } — the full reachable space was exhausted.
 * - { status: 'budget' }     — node/time budget hit before an answer.
 */
export function solveBFS(bottles, cap, { maxNodes = 300000, timeLimitMs = 4000 } = {}) {
  const initial = bottles.map(b => [...b]);

  if (_solverIsSolved(initial, cap)) {
    return { status: 'solved', moves: 0, firstMove: null };
  }

  const startTime = Date.now();
  const visited = new Set([_solverKey(initial)]);
  // Use array + head pointer instead of shift() for O(1) dequeue.
  // `first` is the root move that started this branch, carried along
  // so the optimal first move can be reported for hints.
  const queue = [{ state: initial, g: 0, first: null }];
  let head = 0;

  while (head < queue.length) {
    if (visited.size >= maxNodes) return { status: 'budget' };
    if ((head & 0x3ff) === 0 && Date.now() - startTime > timeLimitMs) return { status: 'budget' };

    const { state, g, first } = queue[head++];
    const n = state.length;

    for (let i = 0; i < n; i++) {
      const src = state[i];
      if (!src.length) continue;
      // Skip completed bottles (full + single color)
      if (src.length === cap && src.every(s => s === src[0])) continue;

      const srcTop = src[src.length - 1];
      const srcRun = _solverTopRun(src);

      for (let j = 0; j < n; j++) {
        if (i === j) continue;
        const dst = state[j];
        if (dst.length >= cap) continue;

        // Color match: destination must be empty or same top color
        if (dst.length > 0 && dst[dst.length - 1] !== srcTop) continue;

        // Prune: don't pour a single-color bottle into empty (pointless rearrange)
        if (dst.length === 0 && src.every(s => s === src[0])) continue;

        // Apply pour
        const amount = Math.min(srcRun, cap - dst.length);
        const next = state.map(b => [...b]);
        for (let t = 0; t < amount; t++) {
          next[j].push(next[i].pop());
        }

        const nk = _solverKey(next);
        if (visited.has(nk)) continue;
        visited.add(nk);

        const nextFirst = first || { from: i, to: j };

        // Goal check immediately on new state
        if (_solverIsSolved(next, cap)) {
          return { status: 'solved', moves: g + 1, firstMove: nextFirst };
        }

        queue.push({ state: next, g: g + 1, first: nextFirst });
      }
    }
  }

  // Reachable space exhausted within budget: genuinely no solution
  return { status: 'unsolvable' };
}

/**
 * Star rating based on player moves vs optimal.
 *
 * - 3 stars: near optimal (extra <= ~10% + 2)
 * - 2 stars: acceptable (extra <= ~25% + 5)
 * - 1 star:  completed but with many extra moves
 * - 0:       Mopt unknown (solver couldn't compute)
 */
export function starsFromMoves(M, Mopt) {
  if (Mopt <= 0) return 0;
  const extra = Math.max(0, M - Mopt);
  const t3 = Math.ceil(0.10 * Mopt) + 2;
  const t2 = Math.ceil(0.25 * Mopt) + 5;
  if (extra <= t3) return 3;
  if (extra <= t2) return 2;
  return 1;
}
