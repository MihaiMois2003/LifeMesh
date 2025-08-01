// src/shared/constants/futuristicTheme.ts
import { Colors as BaseColors } from "./theme";

// Extend your existing theme with futuristic colors
export const FuturisticColors = {
  ...BaseColors,

  // Cyber colors
  cyber: {
    neon: "#00ff88", // Bright green neon
    electric: "#0080ff", // Electric blue
    magenta: "#ff0080", // Hot magenta
    plasma: "#8a2be2", // Blue violet
    hologram: "#40e0d0", // Turquoise
    matrix: "#00ff41", // Matrix green
    void: "#0a0a0a", // Deep black
    steel: "#1a1a2e", // Dark steel
    chrome: "#16213e", // Chrome blue
    quantum: "#0f3460", // Quantum blue
  },

  // Glow effects
  glow: {
    neon: "rgba(0, 255, 136, 0.6)",
    electric: "rgba(0, 128, 255, 0.6)",
    magenta: "rgba(255, 0, 128, 0.6)",
    plasma: "rgba(138, 43, 226, 0.6)",
  },

  // Semi-transparent overlays
  overlay: {
    neon: "rgba(0, 255, 136, 0.1)",
    electric: "rgba(0, 128, 255, 0.1)",
    magenta: "rgba(255, 0, 128, 0.1)",
    dark: "rgba(10, 10, 10, 0.9)",
    glass: "rgba(255, 255, 255, 0.05)",
  },
};

// Futuristic shadows with glow effects
export const FuturisticShadows = {
  neonGlow: {
    shadowColor: FuturisticColors.cyber.neon,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 8,
  },
  electricGlow: {
    shadowColor: FuturisticColors.cyber.electric,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 12,
    elevation: 6,
  },
  magentaGlow: {
    shadowColor: FuturisticColors.cyber.magenta,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 5,
  },
  quantumField: {
    shadowColor: FuturisticColors.cyber.quantum,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
};

// Animation configurations
export const FuturisticAnimations = {
  // Spring configurations
  spring: {
    gentle: { damping: 20, stiffness: 120 },
    bouncy: { damping: 12, stiffness: 150 },
    snappy: { damping: 15, stiffness: 200 },
  },

  // Timing configurations
  timing: {
    fast: { duration: 200 },
    medium: { duration: 400 },
    slow: { duration: 800 },
    epic: { duration: 1200 },
  },

  // Sequence delays
  stagger: {
    quick: 50,
    medium: 100,
    slow: 200,
  },
};
