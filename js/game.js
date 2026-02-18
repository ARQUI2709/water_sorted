// ============================================
// GAME LOGIC
// ============================================

// --- Level scaling ---

function numColorsForLevel(level) {
  if (level <= 19) return Math.min(3 + Math.floor((level - 1) / 2), 12);
  return 12 + Math.floor((level - 20) / 5) + 1;
}

function numEmptyBottles(numColors) {
  return 2 + Math.floor((numColors - 1) / 5);
}

function hiddenSegmentsForLevel(level) {
  if (level < 30) return 0;
  return Math.min(Math.floor((level - 25) / 5), BOTTLE_CAPACITY - 1);
}

// --- Utilities ---

function shuffleArray(array) {
  const result = [...array];
  for (let pass = 0; pass < 5; pass++) {
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
  }
  return result;
}

// --- Level generation ---

function generateLevel(level) {
  const numColors  = numColorsForLevel(level);
  const numEmpty   = numEmptyBottles(numColors);
  const hiddenCount = hiddenSegmentsForLevel(level);

  // Build and shuffle a flat array of color indices
  const segments = [];
  for (let c = 0; c < numColors; c++) {
    for (let i = 0; i < BOTTLE_CAPACITY; i++) segments.push(c);
  }
  const shuffled = shuffleArray(segments);

  // Distribute into bottles
  const bottles = [];
  for (let i = 0; i < numColors; i++) {
    bottles.push(shuffled.slice(i * BOTTLE_CAPACITY, (i + 1) * BOTTLE_CAPACITY));
  }
  for (let i = 0; i < numEmpty; i++) bottles.push([]);

  // Build revealed mask (hidden segments are false)
  const revealed = bottles.map(bottle => {
    if (!hiddenCount || !bottle.length) return bottle.map(() => true);
    return bottle.map((_, idx) => idx >= hiddenCount);
  });

  return { bottles, numColors, numEmpty, hiddenCount, revealed };
}

// --- Bottle queries ---

const topColor = (bottle) => bottle.length ? bottle[bottle.length - 1] : -1;

function topColorCount(bottle) {
  if (!bottle.length) return 0;
  const top = bottle[bottle.length - 1];
  let count = 0;
  for (let i = bottle.length - 1; i >= 0; i--) {
    if (bottle[i] === top) count++;
    else break;
  }
  return count;
}

const isSingleColor = (bottle) =>
  bottle.length > 0 && bottle.every(s => s === bottle[0]);

const isDoneBottle = (bottle, revealedArr) =>
  bottle.length === BOTTLE_CAPACITY &&
  bottle.every(s => s === bottle[0]) &&
  (!revealedArr || revealedArr.every(Boolean));

// --- Move validation ---

function canPour(bottles, from, to) {
  if (from === to) return false;
  const src = bottles[from];
  const dst = bottles[to];
  if (!src.length || dst.length >= BOTTLE_CAPACITY) return false;
  // Don't move a completed bottle to an empty slot
  if (!dst.length && src.length === BOTTLE_CAPACITY && isSingleColor(src)) return false;
  return !dst.length || topColor(src) === topColor(dst);
}

function pourCount(bottles, from, to) {
  if (!canPour(bottles, from, to)) return 0;
  return Math.min(topColorCount(bottles[from]), BOTTLE_CAPACITY - bottles[to].length);
}

// --- Move execution ---

function pour(bottles, revealed, from, to) {
  if (!canPour(bottles, from, to)) return null;

  const newBottles  = bottles.map(b => [...b]);
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

const isWinCondition = (bottles, revealed) =>
  bottles.every((bottle, i) =>
    !bottle.length ||
    (bottle.length === BOTTLE_CAPACITY &&
     bottle.every(s => s === bottle[0]) &&
     revealed[i].every(Boolean))
  );

function isDeadlocked(bottles) {
  for (let from = 0; from < bottles.length; from++) {
    if (!bottles[from].length) continue;
    for (let to = 0; to < bottles.length; to++) {
      if (canPour(bottles, from, to)) return false;
    }
  }
  return true;
}

function findHint(bottles) {
  for (let from = 0; from < bottles.length; from++) {
    if (!bottles[from].length || isDoneBottle(bottles[from], null)) continue;
    for (let to = 0; to < bottles.length; to++) {
      if (canPour(bottles, from, to)) return { from, to };
    }
  }
  return null;
}

// --- Layout calculation ---

function calculateLayout(totalBottles, vw, boardH) {
  const availW = vw - 16;
  const availH = boardH - 16;
  const gap    = 6;

  let bestSize = 20, bestCols = totalBottles, bestRows = 1;

  for (let rows = 1; rows <= 4; rows++) {
    const cols   = Math.ceil(totalBottles / rows);
    const maxW   = Math.floor((availW - gap * (cols - 1)) / cols);
    const maxH   = Math.floor((availH - gap * (rows - 1)) / (rows * 2.8));
    const size   = Math.max(24, Math.min(maxW, maxH));

    if (size > bestSize || (size === bestSize && rows < bestRows)) {
      bestSize = size;
      bestCols = cols;
      bestRows = rows;
    }
  }

  return { size: bestSize, cols: bestCols, gap };
}
