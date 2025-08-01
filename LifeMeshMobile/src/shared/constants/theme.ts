// src/shared/constants/theme.ts - Enhanced Version
export const Colors = {
  // Primary (Dark Green Theme) - Your existing colors
  primary: {
    50: "#f0fdf4",
    100: "#dcfce7",
    200: "#bbf7d0",
    300: "#86efac",
    400: "#4ade80",
    500: "#22c55e",
    600: "#16a34a", // Main green
    700: "#15803d",
    800: "#166534",
    900: "#14532d",
  },

  // Secondary (Enhanced neutral grays)
  secondary: {
    50: "#f8fafc",
    100: "#f1f5f9",
    200: "#e2e8f0",
    300: "#cbd5e1",
    400: "#94a3b8",
    500: "#64748b",
    600: "#475569",
    700: "#334155",
    800: "#1e293b",
    900: "#0f172a",
  },

  // Accent (Golden yellow) - Your existing colors
  accent: {
    50: "#fefce8",
    100: "#fef3c7",
    200: "#fde68a",
    300: "#fcd34d",
    400: "#fbbf24",
    500: "#f59e0b",
    600: "#d97706",
    700: "#b45309",
    800: "#92400e",
    900: "#78350f",
  },

  // NEW: Complementary teal (pairs beautifully with green)
  teal: {
    50: "#f0fdfa",
    100: "#ccfbf1",
    200: "#99f6e4",
    300: "#5eead4",
    400: "#2dd4bf",
    500: "#14b8a6",
    600: "#0d9488",
    700: "#0f766e",
    800: "#115e59",
    900: "#134e4a",
  },

  // NEW: Soft purple (adds sophistication)
  purple: {
    50: "#faf5ff",
    100: "#f3e8ff",
    200: "#e9d5ff",
    300: "#d8b4fe",
    400: "#c084fc",
    500: "#a855f7",
    600: "#9333ea",
    700: "#7c3aed",
    800: "#6b21a8",
    900: "#581c87",
  },

  // NEW: Warm orange (energetic, community feel)
  orange: {
    50: "#fff7ed",
    100: "#ffedd5",
    200: "#fed7aa",
    300: "#fdba74",
    400: "#fb923c",
    500: "#f97316",
    600: "#ea580c",
    700: "#c2410c",
    800: "#9a3412",
    900: "#7c2d12",
  },

  // Semantic colors (enhanced)
  success: "#22c55e",
  warning: "#f59e0b",
  error: "#ef4444",
  info: "#3b82f6",

  // Status colors for activities
  status: {
    online: "#22c55e",
    away: "#f59e0b",
    busy: "#ef4444",
    offline: "#94a3b8",
  },

  // Neutrals
  white: "#ffffff",
  black: "#000000",
  transparent: "transparent",

  // Text (enhanced)
  text: {
    primary: "#0f172a",
    secondary: "#64748b",
    tertiary: "#94a3b8",
    inverse: "#ffffff",
    muted: "#cbd5e1",
  },

  // Background (enhanced)
  background: {
    primary: "#ffffff",
    secondary: "#f8fafc",
    tertiary: "#f1f5f9",
    dark: "#0f172a",
    overlay: "rgba(0, 0, 0, 0.5)",
  },

  // NEW: Social media specific colors
  social: {
    like: "#ef4444", // Red for likes/hearts
    comment: "#3b82f6", // Blue for comments
    share: "#22c55e", // Green for shares
    bookmark: "#f59e0b", // Orange for bookmarks
  },
};

// Typography (your existing + enhancements)
export const Typography = {
  fontSizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    "2xl": 24,
    "3xl": 30,
    "4xl": 36,
    "5xl": 48,
    "6xl": 60,
  },

  lineHeights: {
    xs: 16,
    sm: 20,
    base: 24,
    lg: 28,
    xl: 28,
    "2xl": 32,
    "3xl": 36,
    "4xl": 40,
    "5xl": 48,
    "6xl": 60,
  },

  fontWeights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  } as const,

  // NEW: Letter spacing for better readability
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
    widest: 2,
  },
};

// Spacing (your existing)
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  "2xl": 48,
  "3xl": 64,
  "4xl": 80,
  "5xl": 96,
};

// Border Radius (your existing + enhancements)
export const BorderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  "2xl": 24,
  "3xl": 32,
  full: 9999,
};

// Shadows (enhanced with more options)
export const Shadows = {
  none: {},
  sm: {
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  lg: {
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 5,
  },
  xl: {
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 8,
  },
  // NEW: Colored shadows for special effects
  colored: {
    green: {
      shadowColor: Colors.primary[600],
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
    accent: {
      shadowColor: Colors.accent[500],
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 6,
    },
  },
};

// NEW: Animation presets
export const Animations = {
  timing: {
    fast: { duration: 200 },
    medium: { duration: 400 },
    slow: { duration: 600 },
  },
  spring: {
    gentle: { damping: 20, stiffness: 100 },
    bouncy: { damping: 15, stiffness: 150 },
    snappy: { damping: 10, stiffness: 200 },
  },
  stagger: {
    items: 100,
    cards: 150,
    sections: 200,
  },
};
