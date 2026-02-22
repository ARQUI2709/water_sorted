// ============================================
// LOCAL STORAGE HELPERS
// ============================================

function storageGet(key, defaultValue) {
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? raw : defaultValue;
  } catch {
    return defaultValue;
  }
}

function storageSet(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch { }
}

// --- Per-level best moves ---

function getBestMoves(level) {
  return parseInt(storageGet(`wb${level}`, 0)) || 0;
}

function saveBestMoves(level, moves) {
  const previous = getBestMoves(level);
  if (!previous || moves < previous) storageSet(`wb${level}`, moves);
}

// --- Win streak ---

function getStreak() { return parseInt(storageGet('wstreak', 0)) || 0; }
function saveStreak(value) { storageSet('wstreak', value); }

// --- Preferences ---

function getMuted() { return storageGet('wmute', '0') === '1'; }
function saveMuted(value) { storageSet('wmute', value ? '1' : '0'); }

function getPatternMode() { return storageGet('wpat', '0') === '1'; }
function savePatternMode(value) { storageSet('wpat', value ? '1' : '0'); }

function getSavedLevel() { return parseInt(storageGet('wsp_level', 1)) || 1; }
function saveLevel(level) { storageSet('wsp_level', level); }

// --- Stars ---

function getBestStars(level) { return parseInt(storageGet(`wstar${level}`, 0)) || 0; }
function saveBestStars(level, stars) {
  const prev = getBestStars(level);
  if (stars > prev) storageSet(`wstar${level}`, stars);
}

// --- Difficulty ---

function getDifficulty() { return storageGet('wdiff', 'normal'); }
function saveDifficulty(value) { storageSet('wdiff', value); }

// --- Background ---

function getBackground() { return storageGet('wbg', 'default'); }
function saveBackground(value) { storageSet('wbg', value); }
