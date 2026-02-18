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

// Returns a color string for a given index.
// Falls back to HSL for indexes beyond the palette.
function getColor(index) {
  if (index < MAIN_COLORS.length) return MAIN_COLORS[index];
  const offset = index - MAIN_COLORS.length;
  return `hsl(${(offset * 137.508 + 60) % 360}, 75%, ${45 + (offset % 3) * 10}%)`;
}
