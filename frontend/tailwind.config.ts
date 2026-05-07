import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: "#09090B",
          panel: "rgba(24, 24, 27, 0.6)",
          border: "#27272a",
          accent: "#ef4444",
          accentHover: "#dc2626",
          cyan: "#22d3ee",
          mute: "#a1a1aa",
        },
        academy: {
          bg: "#0b0b10",
          panel: "rgba(24, 22, 30, 0.65)",
          accent: "#ff5b3a",
          accentHover: "#f04822",
          mute: "#a1a1aa",
        },
        arena: {
          bg: "#0a0a0d",
          panel: "rgba(20, 20, 24, 0.7)",
          accent: "#ff5b3a",
          accentHover: "#f04822",
          mute: "#a1a1aa",
        },
        obsidian: {
          bg: "#08080a",
          panel: "rgba(20, 20, 24, 0.85)",
          accent: "#ef4444",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        "glow-red": "0 0 40px -10px rgba(239,68,68,0.55), 0 0 80px -30px rgba(239,68,68,0.45)",
        "glow-orange": "0 0 40px -10px rgba(255,91,58,0.55), 0 0 80px -30px rgba(255,91,58,0.45)",
        "glow-cyan": "0 0 30px -10px rgba(34,211,238,0.45)",
        "panel": "0 1px 0 rgba(255,255,255,0.04) inset, 0 0 0 1px rgba(63,63,70,0.4)",
      },
      backgroundImage: {
        "grid-faint":
          "linear-gradient(rgba(63,63,70,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(63,63,70,0.12) 1px, transparent 1px)",
        "grid-bold":
          "linear-gradient(rgba(255,91,58,0.10) 1px, transparent 1px), linear-gradient(90deg, rgba(255,91,58,0.10) 1px, transparent 1px)",
        "radial-red":
          "radial-gradient(60% 50% at 50% 40%, rgba(239,68,68,0.18) 0%, rgba(239,68,68,0.04) 45%, rgba(0,0,0,0) 75%)",
        "radial-orange":
          "radial-gradient(70% 60% at 70% 20%, rgba(255,91,58,0.22) 0%, rgba(255,91,58,0.05) 45%, rgba(0,0,0,0) 75%)",
        "rays-red":
          "conic-gradient(from 180deg at 50% 50%, rgba(239,68,68,0) 0deg, rgba(239,68,68,0.06) 60deg, rgba(239,68,68,0) 120deg, rgba(239,68,68,0.06) 180deg, rgba(239,68,68,0) 240deg, rgba(239,68,68,0.06) 300deg, rgba(239,68,68,0) 360deg)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
        "scan": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        "blink": {
          "0%, 49%": { opacity: "1" },
          "50%, 100%": { opacity: "0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.4s ease-out both",
        "pulse-soft": "pulse-soft 2.5s ease-in-out infinite",
        "scan": "scan 6s linear infinite",
        "blink": "blink 1s steps(2, end) infinite",
      },
    },
  },
  plugins: [],
};

export default config;
