// ============================================
// SOLVER — BFS for optimal moves + star rating
// ============================================

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
 * BFS solver: returns minimum moves to solve, or -1 if budget exceeded.
 * Uses canonical state keys for dedup (handles symmetry).
 * Adaptive node budget based on number of colors.
 */
function solveBFS(bottles, cap) {
  const numFilled = bottles.filter(b => b.length > 0).length;
  // Adaptive budget: smaller for bigger puzzles to avoid freezing
  const maxNodes = numFilled <= 5 ? 80000
    : numFilled <= 7 ? 50000
    : numFilled <= 9 ? 25000
    : numFilled <= 12 ? 10000
    : 0; // skip solving for very large levels

  if (maxNodes === 0) return -1;

  const initial = bottles.map(b => [...b]);

  if (_solverIsSolved(initial, cap)) return 0;

  const initKey = _solverKey(initial);
  const visited = new Set([initKey]);
  // Use array + head pointer instead of shift() for O(1) dequeue
  const queue = [{ state: initial, g: 0 }];
  let head = 0;

  while (head < queue.length) {
    if (visited.size >= maxNodes) return -1;

    const { state, g } = queue[head++];
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

        // Goal check immediately on new state
        if (_solverIsSolved(next, cap)) return g + 1;

        queue.push({ state: next, g: g + 1 });
      }
    }
  }

  return -1; // no solution found within budget
}

/**
 * Star rating based on player moves vs optimal.
 *
 * - 3 stars: near optimal (extra <= ~10% + 2)
 * - 2 stars: acceptable (extra <= ~25% + 5)
 * - 1 star:  completed but with many extra moves
 * - 0:       Mopt unknown (solver couldn't compute)
 */
function starsFromMoves(M, Mopt) {
  if (Mopt <= 0) return 0;
  const extra = Math.max(0, M - Mopt);
  const t3 = Math.ceil(0.10 * Mopt) + 2;
  const t2 = Math.ceil(0.25 * Mopt) + 5;
  if (extra <= t3) return 3;
  if (extra <= t2) return 2;
  return 1;
}
