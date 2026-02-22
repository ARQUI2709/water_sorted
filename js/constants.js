// ============================================
// CONSTANTS
// ============================================

const BOTTLE_CAPACITY = 4;

const MAIN_COLORS = [
  "#E6194B", "#3CB44B", "#4363D8", "#F58231", "#911EB4", "#42D4F4",
  "#F032E6", "#BFEF45", "#FABED4", "#469990", "#DCBEFF", "#9A6324",
  "#FFFAC8", "#800000", "#AAFFC3", "#808000", "#FFD8B1", "#000075",
  "#A9A9A9", "#FFE119", "#E6BEFF", "#AA6E28", "#00FFAA", "#FF4444"
];

const COLOR_NAMES = [
  "Red", "Green", "Blue", "Orange", "Purple", "Cyan",
  "Magenta", "Lime", "Pink", "Teal", "Lavender", "Brown",
  "Beige", "Maroon", "Mint", "Olive", "Apricot", "Navy",
  "Grey", "Yellow", "Orchid", "Tan", "Spring", "Coral"
];

const PATTERNS = [
  "///", "···", "xxx", "ooo", "+++", "---",
  "\\\\\\", "≡≡≡", ":::", "###", "%%%", "@@@",
  "&&&", "^^^", "~~~", "|||", "***", "===",
  "◊◊◊", "○○○", "◇◇◇", "△△△", "□□□", "♦♦♦"
];

const FONTS = {
  default: "'Rajdhani', sans-serif",
  orbitron: "'Orbitron', sans-serif",
};

const BACKGROUNDS = [
  { id: 'default', name: 'Nebula', url: null, colors: ['#0f0c29', '#302b63', '#24243e'] },
  { id: 'forest', name: 'Forest', url: 'assets/forest-bg.png' },
  { id: 'lava', name: 'Lava', url: 'assets/lava-bg.png' },
  { id: 'minimalist', name: 'Minimalist', url: 'assets/minimalist-bg.png' },
  { id: 'sea', name: 'Sea', url: 'assets/sea-bg.png' },
  { id: 'space', name: 'Space', url: 'assets/space-bg.png' },
];

// Difficulty limits: undo cap and hints per tier
const DIFFICULTY_LIMITS = {
  easy: { undos: Infinity, hints: 5 },
  normal: { undos: 10, hints: 3 },
  hard: { undos: 3, hints: 2 },
};

// Difficulty ranges: E (empty bottles) per [band][CAP]
// Band 0: N 3–8, Band 1: N 9–20, Band 2: N 21–36
const DIFFICULTY_RANGES = {
  4: [[2, 4], [2, 4], [3, 5]],
  5: [[2, 4], [3, 5], [4, 6]],
  6: [[3, 5], [4, 6], [5, 7]],
};

// Returns a color string for a given index.
// Falls back to HSL for indexes beyond the palette.
function getColor(index) {
  if (index < MAIN_COLORS.length) return MAIN_COLORS[index];
  const offset = index - MAIN_COLORS.length;
  return `hsl(${(offset * 137.508 + 60) % 360}, 75%, ${45 + (offset % 3) * 10}%)`;
}
