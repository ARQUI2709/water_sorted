// ============================================
// LOCAL STORAGE HELPERS
// ============================================

// All keys are namespaced to avoid collisions with other apps served
// from the same origin (e.g. other projects on usuario.github.io).
const PREFIX = 'wsp:';

export function storageGet(key, defaultValue) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw !== null ? raw : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function storageSet(key, value) {
  try {
    localStorage.setItem(PREFIX + key, value);
  } catch { }
}

// --- One-shot migration from the pre-namespace key scheme ---
//
// Older builds stored keys without the `wsp:` prefix and only tracked the
// *current* level (`wsp_level`), which a map-replay could rewind. Besides
// copying every legacy key, this seeds `maxlevel` from the highest level
// with a recorded best/stars so progress lost to that bug is restored.
const LEGACY_KEYS = ['wstreak', 'wbeststreak', 'whardwins', 'wmute', 'wpat', 'wsp_level', 'wdiff', 'wbg'];

export function migrateStorage() {
  try {
    if (localStorage.getItem(PREFIX + 'migrated')) return;

    const toCopy = [];
    let maxCompleted = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      const perLevel = key.match(/^(?:wb|wstar)(\d+)$/);
      if (perLevel) {
        toCopy.push(key);
        maxCompleted = Math.max(maxCompleted, parseInt(perLevel[1], 10));
      } else if (LEGACY_KEYS.includes(key)) {
        toCopy.push(key);
      }
    }
    for (const key of toCopy) {
      localStorage.setItem(PREFIX + key, localStorage.getItem(key));
    }

    const savedLevel = parseInt(localStorage.getItem('wsp_level'), 10) || 1;
    const maxLevel = Math.max(savedLevel, maxCompleted ? maxCompleted + 1 : 1);
    const existing = parseInt(localStorage.getItem(PREFIX + 'maxlevel'), 10) || 0;
    if (maxLevel > existing) localStorage.setItem(PREFIX + 'maxlevel', maxLevel);

    localStorage.setItem(PREFIX + 'migrated', '1');
  } catch { }
}

// --- Per-level best moves ---

export function getBestMoves(level) {
  return parseInt(storageGet(`wb${level}`, 0)) || 0;
}

export function saveBestMoves(level, moves) {
  const previous = getBestMoves(level);
  if (!previous || moves < previous) storageSet(`wb${level}`, moves);
}

// --- Win streak ---

export function getStreak() { return parseInt(storageGet('wstreak', 0)) || 0; }
export function saveStreak(value) { storageSet('wstreak', value); }

export function getBestStreak() { return parseInt(storageGet('wbeststreak', 0)) || 0; }
export function saveBestStreak(value) {
  if (value > getBestStreak()) storageSet('wbeststreak', value);
}

// --- Hard-difficulty wins ---

export function getHardWins() { return parseInt(storageGet('whardwins', 0)) || 0; }
export function incrementHardWins() { storageSet('whardwins', getHardWins() + 1); }

// --- Preferences ---

export function getMuted() { return storageGet('wmute', '0') === '1'; }
export function saveMuted(value) { storageSet('wmute', value ? '1' : '0'); }

export function getPatternMode() { return storageGet('wpat', '0') === '1'; }
export function savePatternMode(value) { storageSet('wpat', value ? '1' : '0'); }

// --- Level progress ---
//
// `wsp_level` is the level currently being played; `maxlevel` is the highest
// level ever reached. They differ when an earlier level is replayed from the
// map — locking and achievements must use `maxlevel`, never the current one.

export function getSavedLevel() { return parseInt(storageGet('wsp_level', 1)) || 1; }
export function saveLevel(level) { storageSet('wsp_level', level); }

export function getMaxLevel() {
  const stored = parseInt(storageGet('maxlevel', 1)) || 1;
  return Math.max(stored, getSavedLevel());
}
export function saveMaxLevel(level) {
  if (level > (parseInt(storageGet('maxlevel', 0)) || 0)) storageSet('maxlevel', level);
}

// --- Stars ---

export function getBestStars(level) { return parseInt(storageGet(`wstar${level}`, 0)) || 0; }
export function saveBestStars(level, stars) {
  const prev = getBestStars(level);
  if (stars > prev) storageSet(`wstar${level}`, stars);
}

// --- Difficulty ---

export function getDifficulty() { return storageGet('wdiff', 'normal'); }
export function saveDifficulty(value) { storageSet('wdiff', value); }

// --- Background ---

export function getBackground() { return storageGet('wbg', 'default'); }
export function saveBackground(value) { storageSet('wbg', value); }

// --- One-time UI flags ---

export function getTutorialSeen() { return storageGet('wtut', '0') === '1'; }
export function saveTutorialSeen() { storageSet('wtut', '1'); }

export function getLegendSeen() { return storageGet('wlegend', '0') === '1'; }
export function saveLegendSeen() { storageSet('wlegend', '1'); }
