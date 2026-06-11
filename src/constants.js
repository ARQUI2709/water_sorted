// ============================================
// CONSTANTS
// ============================================

export const BOTTLE_CAPACITY = 4;

export const MAIN_COLORS = [
  "#E6194B", "#3CB44B", "#4363D8", "#F58231", "#911EB4", "#42D4F4",
  "#F032E6", "#BFEF45", "#FABED4", "#469990", "#DCBEFF", "#9A6324",
  "#FFFAC8", "#800000", "#AAFFC3", "#808000", "#FFD8B1", "#000075",
  "#A9A9A9", "#FFE119", "#E6BEFF", "#AA6E28", "#00FFAA", "#FF4444"
];

export const COLOR_NAMES = [
  "Red", "Green", "Blue", "Orange", "Purple", "Cyan",
  "Magenta", "Lime", "Pink", "Teal", "Lavender", "Brown",
  "Beige", "Maroon", "Mint", "Olive", "Apricot", "Navy",
  "Grey", "Yellow", "Orchid", "Tan", "Spring", "Coral"
];

export const PATTERNS = [
  "///", "···", "xxx", "ooo", "+++", "---",
  "\\\\\\", "≡≡≡", ":::", "###", "%%%", "@@@",
  "&&&", "^^^", "~~~", "|||", "***", "===",
  "◊◊◊", "○○○", "◇◇◇", "△△△", "□□□", "♦♦♦"
];

export const FONTS = {
  default: "'Rajdhani', sans-serif",
  orbitron: "'Orbitron', sans-serif",
};

export const BACKGROUNDS = [
  { id: 'default', name: 'Nebula', url: null, colors: ['#0f0c29', '#302b63', '#24243e'] },
  { id: 'forest', name: 'Forest', url: 'assets/forest-bg.webp' },
  { id: 'lava', name: 'Lava', url: 'assets/lava-bg.webp' },
  { id: 'minimalist', name: 'Minimalist', url: 'assets/minimalist-bg.png' },
  { id: 'sea', name: 'Sea', url: 'assets/sea-bg.webp' },
  { id: 'space', name: 'Space', url: 'assets/space-bg.webp' },
];

// Difficulty limits: undo cap and hints per tier
export const DIFFICULTY_LIMITS = {
  easy: { undos: Infinity, hints: 5 },
  normal: { undos: 10, hints: 3 },
  hard: { undos: 3, hints: 2 },
};

// Difficulty ranges: E (empty bottles) per [band][CAP]
// Band 0: N 3–8, Band 1: N 9–20, Band 2: N 21–36
export const DIFFICULTY_RANGES = {
  4: [[2, 4], [2, 4], [3, 5]],
  5: [[2, 4], [3, 5], [4, 6]],
  6: [[3, 5], [4, 6], [5, 7]],
};

// UI design tokens — single source for chrome surfaces, type, and layers.
export const UI = {
  surface: {
    base: "rgba(255,255,255,0.06)",
    raised: "rgba(255,255,255,0.10)",
    active: "rgba(255,255,255,0.15)",
  },
  border: {
    subtle: "1px solid rgba(255,255,255,0.10)",
    strong: "1px solid rgba(255,255,255,0.25)",
  },
  text: {
    primary: "rgba(255,255,255,0.9)",
    secondary: "rgba(255,255,255,0.65)",
    muted: "rgba(255,255,255,0.45)",
  },
  radius: { sm: 10, md: 14, lg: 20, pill: 999 },
  font: { xs: "0.65rem", sm: "0.75rem", md: "0.85rem", lg: "1rem", xl: "1.2rem" },
  z: { bg: 0, board: 10, chrome: 20, home: 40, win: 50, confetti: 60, overlay: 70, toast: 90 },
  accent: {
    primary: "#8b5cf6",
    primaryGrad: "linear-gradient(135deg,#8b5cf6,#6366f1)",
    gold: "#fbbf24",
    goldGrad: "linear-gradient(135deg,#fbbf24,#f59e0b)",
    danger: "#f87171",
  },
  titleGrad: "linear-gradient(135deg,#fff,#c084fc,#818cf8)",
  panel: "linear-gradient(160deg, rgba(30,20,60,0.97), rgba(20,15,45,0.97))",
  panelFull: "linear-gradient(160deg, rgba(15,12,41,0.97), rgba(48,43,99,0.97) 50%, rgba(36,36,62,0.97))",
  backdrop: { background: "rgba(0,0,0,0.6)", backdropFilter: "blur(10px)" },
};

// Returns a color string for a given index.
// Falls back to HSL for indexes beyond the palette.
export function getColor(index) {
  if (index < MAIN_COLORS.length) return MAIN_COLORS[index];
  const offset = index - MAIN_COLORS.length;
  return `hsl(${(offset * 137.508 + 60) % 360}, 75%, ${45 + (offset % 3) * 10}%)`;
}
