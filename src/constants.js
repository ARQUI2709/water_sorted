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
  default: "'Baloo 2', system-ui, sans-serif",
  orbitron: "'Lilita One', 'Baloo 2', cursive",
};

export const BACKGROUNDS = [
  { id: 'default',    name: 'Nebula',     icon: '🪐', url: null,                       colors: ['#070b26', '#101750', '#1b2468'] },
  { id: 'forest',     name: 'Forest',     icon: '🌳', url: 'assets/forest-bg.webp' },
  { id: 'lava',       name: 'Lava',       icon: '🌋', url: 'assets/lava-bg.webp' },
  { id: 'minimalist', name: 'Minimalist', icon: '⬜', url: 'assets/minimalist-bg.png' },
  { id: 'sea',        name: 'Sea',        icon: '🌊', url: 'assets/sea-bg.webp' },
  { id: 'space',      name: 'Space',      icon: '⭐', url: 'assets/space-bg.webp' },
];

// Difficulty limits: undo cap and hints per tier
export const DIFFICULTY_LIMITS = {
  easy:   { undos: Infinity, hints: 5, addBottles: 5 },
  normal: { undos: 10,       hints: 3, addBottles: 3 },
  hard:   { undos: 3,        hints: 2, addBottles: 1 },
};

// Difficulty ranges: E (empty bottles) per [band][CAP]
// Band 0: N 3–8, Band 1: N 9–20, Band 2: N 21–36
export const DIFFICULTY_RANGES = {
  4: [[2, 4], [2, 4], [3, 5]],
  5: [[2, 4], [3, 5], [4, 6]],
  6: [[3, 5], [4, 6], [5, 7]],
};

// Candy 3D shadow helper — inset highlight + bottom edge lift
export function candy3d(edge, lift = 4) {
  return `inset 0 2px 0 rgba(255,255,255,0.45), inset 0 -3px 0 rgba(0,0,0,0.15), 0 ${lift}px 0 ${edge}, 0 ${lift + 6}px 14px rgba(0,0,0,0.35)`;
}

// UI design tokens — single source for chrome surfaces, type, and layers.
export const UI = {
  surface: {
    base:   "rgba(255,255,255,0.08)",
    raised: "rgba(255,255,255,0.13)",
    active: "rgba(255,255,255,0.18)",
  },
  border: {
    subtle: "1px solid rgba(255,255,255,0.14)",
    strong: "2px solid rgba(255,255,255,0.40)",
  },
  text: {
    primary:   "rgba(255,255,255,0.9)",
    secondary: "rgba(255,255,255,0.65)",
    muted:     "rgba(255,255,255,0.45)",
  },
  radius: { sm: 12, md: 16, lg: 24, pill: 999 },
  font: { xs: "0.65rem", sm: "0.75rem", md: "0.85rem", lg: "1rem", xl: "1.2rem" },
  z: { bg: 0, board: 10, chrome: 20, home: 40, win: 50, confetti: 60, overlay: 70, toast: 90 },
  accent: {
    primary:     "#8b5cf6",
    primaryGrad: "linear-gradient(90deg,#34d2f7 0%,#5a7bff 55%,#9b5cf6 100%)",
    gold:        "#ffc83d",
    goldGrad:    "linear-gradient(180deg,#ffe27a,#ffaf2e)",
    danger:      "#ff6b8a",
  },
  titleGrad:  "linear-gradient(180deg,#d4b0ff 0%,#9b7bff 45%,#5a9dff 100%)",
  panel:      "linear-gradient(170deg, rgba(30,33,84,0.98), rgba(16,18,54,0.98))",
  panelFull:  "linear-gradient(170deg, rgba(12,16,48,0.97), rgba(22,27,77,0.97) 55%, rgba(14,18,56,0.97))",
  backdrop:   { background: "rgba(5,8,28,0.68)", backdropFilter: "blur(10px)" },
  candy: {
    night: ["#070b26", "#101750", "#1b2468"],
    button: {
      peach:    { grad: "linear-gradient(180deg,#ffd9a0,#ff9e58)", edge: "#c4641f", text: "#7a3c0a" },
      mint:     { grad: "linear-gradient(180deg,#a9f5cd,#3fd68f)", edge: "#0f8f60", text: "#065f41" },
      pink:     { grad: "linear-gradient(180deg,#ffbada,#ff6fae)", edge: "#c23577", text: "#8a1d52" },
      lavender: { grad: "linear-gradient(180deg,#d3bcff,#9d72ff)", edge: "#6438cf", text: "#3f1f8a" },
      sky:      { grad: "linear-gradient(180deg,#aee2ff,#4fa9ff)", edge: "#1f6fd0", text: "#0c4a8a" },
      green:    { grad: "linear-gradient(180deg,#8af0a8,#2fc764)", edge: "#168a45", text: "#0a4a22" },
      blue:     { grad: "linear-gradient(180deg,#9fc4ff,#5a7bff)", edge: "#3346c4", text: "#1a2878" },
    },
    tile: {
      done:    { grad: "linear-gradient(180deg,#ffd96a 0%,#ffab2e 55%,#f07f1d 100%)", edge: "#b05710" },
      current: { grad: "linear-gradient(180deg,#86f0ff 0%,#27c9ee 50%,#0a9cc7 100%)", edge: "#0a7aa0", glow: "0 0 18px rgba(64,224,255,0.55)" },
      locked:  { grad: "linear-gradient(180deg,#c4def8 0%,#85b6e9 55%,#5d92cf 100%)", edge: "#3c6ea8" },
    },
    ring:  "conic-gradient(from 200deg,#ff7ad9,#ff4f9a,#b14fff,#ff7ad9)",
    gloss: "linear-gradient(180deg, rgba(255,255,255,0.50), rgba(255,255,255,0.10) 46%, transparent 50%)",
    inner: "#101740",
  },
};

// Returns a color string for a given index.
// Falls back to HSL for indexes beyond the palette.
export function getColor(index) {
  if (index < MAIN_COLORS.length) return MAIN_COLORS[index];
  const offset = index - MAIN_COLORS.length;
  return `hsl(${(offset * 137.508 + 60) % 360}, 75%, ${45 + (offset % 3) * 10}%)`;
}
