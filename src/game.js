// ============================================
// GAME LOGIC
// ============================================

import { BOTTLE_CAPACITY, DIFFICULTY_RANGES } from './constants.js';

// --- Level scaling ---

export function numColorsForLevel(level) {
  if (level <= 19) return Math.min(3 + Math.floor((level - 1) / 2), 12);
  return 12 + Math.floor((level - 20) / 5) + 1;
}

function chooseE(N, CAP, tier) {
  const band = N <= 8 ? 0 : N <= 20 ? 1 : 2;
  const ranges = (DIFFICULTY_RANGES[CAP] || DIFFICULTY_RANGES[4])[band];
  const [lo, hi] = ranges;
  if (tier === 'hard') return lo;
  if (tier === 'easy') return hi;
  return Math.round((lo + hi) / 2); // normal
}

export function numEmptyBottles(numColors, tier) {
  return chooseE(numColors, BOTTLE_CAPACITY, tier || 'normal');
}

export function hiddenSegmentsForLevel(level) {
  if (level < 30) return 0;
  return Math.min(Math.floor((level - 25) / 5), BOTTLE_CAPACITY - 1);
}

// --- Bottle queries ---

export const topColor = (bottle) => bottle.length ? bottle[bottle.length - 1] : -1;

export function topColorCount(bottle) {
  if (!bottle.length) return 0;
  const top = bottle[bottle.length - 1];
  let count = 0;
  for (let i = bottle.length - 1; i >= 0; i--) {
    if (bottle[i] === top) count++;
    else break;
  }
  return count;
}

export const isSingleColor = (bottle) =>
  bottle.length > 0 && bottle.every(s => s === bottle[0]);

export const isDoneBottle = (bottle, revealedArr) =>
  bottle.length === BOTTLE_CAPACITY &&
  bottle.every(s => s === bottle[0]) &&
  (!revealedArr || revealedArr.every(Boolean));

// --- Level generation ---
//
// Levels are generated *backwards*: start from the solved state and apply
// random reverse pours. Each reverse pour is the exact inverse of a legal
// forward pour, so replaying the inverses in reverse order solves the
// puzzle — every generated level is solvable by construction, at any size,
// and the number of reverse pours is an upper bound on the solution length.

function solvedState(numColors, numEmpty) {
  const bottles = [];
  for (let c = 0; c < numColors; c++) bottles.push(Array(BOTTLE_CAPACITY).fill(c));
  for (let i = 0; i < numEmpty; i++) bottles.push([]);
  return bottles;
}

// A reverse pour moves j top segments of color c from bottle a to bottle b.
// For its inverse (forward pour b -> a) to be legal and move exactly those
// segments back:
//  - b must have space, and its top must not already be c (so the run on b
//    stays exactly j)
//  - a's top after removal must still be c (j < run), or a must end empty
function listReversePours(bottles) {
  const moves = [];
  for (let a = 0; a < bottles.length; a++) {
    const src = bottles[a];
    if (!src.length) continue;
    const run = topColorCount(src);
    const color = src[src.length - 1];
    for (let b = 0; b < bottles.length; b++) {
      if (a === b) continue;
      const dst = bottles[b];
      const space = BOTTLE_CAPACITY - dst.length;
      if (!space) continue;
      if (dst.length && dst[dst.length - 1] === color) continue;
      const jMax = Math.min(run, space);
      for (let j = 1; j <= jMax; j++) {
        if (j === run && src.length !== run) continue;
        moves.push({ a, b, j });
      }
    }
  }
  return moves;
}

function applyReversePours(bottles, target) {
  let applied = 0;
  while (applied < target) {
    const moves = listReversePours(bottles);
    if (!moves.length) break;
    const { a, b, j } = moves[Math.floor(Math.random() * moves.length)];
    const color = bottles[a][bottles[a].length - 1];
    for (let t = 0; t < j; t++) {
      bottles[a].pop();
      bottles[b].push(color);
    }
    applied++;
  }
  return applied;
}

// True if some hidden segment shares its color with the first visible
// segment of the same bottle (revealing it would add no information).
function hasHiddenConflict(bottles, hiddenCount) {
  return bottles.some(bottle => {
    if (bottle.length <= hiddenCount) return false;
    const firstVisible = bottle[hiddenCount];
    for (let i = 0; i < hiddenCount; i++) {
      if (bottle[i] === firstVisible) return true;
    }
    return false;
  });
}

export function generateLevel(level, tier) {
  const numColors = numColorsForLevel(level);
  const numEmpty = numEmptyBottles(numColors, tier);
  const hiddenCount = hiddenSegmentsForLevel(level);
  const targetPours = 8 * numColors;

  const MAX_TRIES = 30;
  let bottles;
  let movesUpperBound = 0;
  for (let attempt = 0; attempt < MAX_TRIES; attempt++) {
    bottles = solvedState(numColors, numEmpty);
    movesUpperBound = applyReversePours(bottles, targetPours);

    // Reject states with a pre-completed bottle; reject hidden-segment
    // conflicts too, but accept those on the final tries (cosmetic issue,
    // solvability is unaffected).
    if (bottles.some(b => isDoneBottle(b, null))) continue;
    if (hiddenCount > 0 && attempt < MAX_TRIES - 3 && hasHiddenConflict(bottles, hiddenCount)) continue;
    break;
  }

  // Build revealed mask (hidden segments are false)
  const revealed = bottles.map(bottle => {
    if (!hiddenCount || !bottle.length) return bottle.map(() => true);
    return bottle.map((_, idx) => idx >= hiddenCount);
  });

  return { bottles, numColors, numEmpty, hiddenCount, revealed, movesUpperBound };
}

// --- Move validation ---

export function canPour(bottles, from, to) {
  if (from === to) return false;
  const src = bottles[from];
  const dst = bottles[to];
  if (!src.length || dst.length >= BOTTLE_CAPACITY) return false;
  // Don't move a completed bottle to an empty slot
  if (!dst.length && src.length === BOTTLE_CAPACITY && isSingleColor(src)) return false;
  return !dst.length || topColor(src) === topColor(dst);
}

export function pourCount(bottles, from, to) {
  if (!canPour(bottles, from, to)) return 0;
  return Math.min(topColorCount(bottles[from]), BOTTLE_CAPACITY - bottles[to].length);
}

// --- Move execution ---

export function pour(bottles, revealed, from, to) {
  if (!canPour(bottles, from, to)) return null;

  const newBottles = bottles.map(b => [...b]);
  const newRevealed = revealed.map(r => [...r]);

  const color = topColor(newBottles[from]);
  const count = Math.min(topColorCount(newBottles[from]), BOTTLE_CAPACITY - newBottles[to].length);

  for (let i = 0; i < count; i++) {
    newRevealed[from].pop();
    newBottles[from].pop();
    newBottles[to].push(color);
    newRevealed[to].push(true);
  }

  // Reveal the new top of the source bottle
  if (newBottles[from].length) {
    newRevealed[from][newBottles[from].length - 1] = true;
  }

  return { bottles: newBottles, revealed: newRevealed };
}

// --- Win / deadlock detection ---

export const isWinCondition = (bottles, revealed) =>
  bottles.every((bottle, i) =>
    !bottle.length ||
    (bottle.length === BOTTLE_CAPACITY &&
      bottle.every(s => s === bottle[0]) &&
      revealed[i].every(Boolean))
  );

export function isDeadlocked(bottles) {
  for (let from = 0; from < bottles.length; from++) {
    if (!bottles[from].length) continue;
    for (let to = 0; to < bottles.length; to++) {
      if (canPour(bottles, from, to)) return false;
    }
  }
  return true;
}

// Heuristic hint, used when the solver can't produce an optimal first move
// within budget: scores every legal pour and returns the most useful one
// instead of the first one found.
export function findHint(bottles) {
  let best = null;
  let bestScore = -Infinity;

  for (let from = 0; from < bottles.length; from++) {
    const src = bottles[from];
    if (!src.length || isDoneBottle(src, null)) continue;

    for (let to = 0; to < bottles.length; to++) {
      if (!canPour(bottles, from, to)) continue;

      const dst = bottles[to];
      const run = topColorCount(src);
      const count = pourCount(bottles, from, to);

      let score = 0;
      // Completes a bottle
      if (dst.length > 0 && isSingleColor(dst) && dst.length + count === BOTTLE_CAPACITY) score += 100;
      // Consolidates onto a same-color, non-empty bottle…
      if (dst.length > 0) score += 10;
      // …and even better if that bottle is clean (no foreign colors buried)
      if (dst.length > 0 && isSingleColor(dst)) score += 10;
      // Moves the whole run (no split left behind)
      if (count === run) score += 5;
      // Empties the source bottle
      if (count === src.length) score += 8;
      // Pouring into an empty bottle is a last resort…
      if (dst.length === 0) score -= 5;
      // …and relocating a single-color bottle into an empty one is a null move
      if (dst.length === 0 && isSingleColor(src)) score -= 100;

      if (score > bestScore) {
        bestScore = score;
        best = { from, to };
      }
    }
  }
  return best;
}

// --- Layout calculation ---

export function calculateLayout(totalBottles, vw, boardH) {
  const availW = vw - 16;
  const availH = boardH - 16;
  const gap = 6;

  let bestSize = 20, bestCols = totalBottles, bestRows = 1;

  for (let rows = 1; rows <= 4; rows++) {
    const cols = Math.ceil(totalBottles / rows);
    const maxW = Math.floor((availW - gap * (cols - 1)) / cols);
    const maxH = Math.floor((availH - gap * (rows - 1)) / (rows * 2.8));
    const size = Math.max(24, Math.min(maxW, maxH));

    if (size > bestSize || (size === bestSize && rows < bestRows)) {
      bestSize = size;
      bestCols = cols;
      bestRows = rows;
    }
  }

  return { size: bestSize, cols: bestCols, gap };
}
