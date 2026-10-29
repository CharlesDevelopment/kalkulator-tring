import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      colors: {
        background: "var(--bg-primary)",
        surface: "var(--bg-surface)",
        "surface-subtle": "var(--bg-subtle)",
        foreground: "var(--text-primary)",
        muted: "var(--text-secondary)",
        border: "var(--border-card)",
        "border-control": "var(--border-control)",
        accent: {
          DEFAULT: "var(--accent-bg)",
          foreground: "var(--accent-fg)",
        },
        gold: {
          text: "var(--gold-text)",
          bg: "var(--gold-bg)",
          border: "var(--gold-border)",
        },
        profit: {
          text: "var(--profit-text)",
          bg: "var(--profit-bg)",
          border: "var(--profit-border)",
        },
        loss: {
          text: "var(--loss-text)",
          bg: "var(--loss-bg)",
          border: "var(--loss-border)",
        },
        warn: {
          text: "var(--warn-text)",
          bg: "var(--warn-bg)",
          border: "var(--warn-border)",
        },
      },
    },
  },
  plugins: [],
};

export default config;
