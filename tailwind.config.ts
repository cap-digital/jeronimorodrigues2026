import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        plane: "var(--plane)",
        surface: {
          1: "var(--surface-1)",
          2: "var(--surface-2)",
          3: "var(--surface-3)",
        },
        ink: {
          DEFAULT: "var(--ink-primary)",
          secondary: "var(--ink-secondary)",
          muted: "var(--ink-muted)",
        },
        pt: {
          red: "var(--pt-red)",
          dark: "var(--pt-red-dark)",
          bright: "var(--pt-red-bright)",
        },
        series: {
          red: "var(--series-red)",
          purple: "var(--series-purple)",
          teal: "var(--series-teal)",
          amber: "var(--series-amber)",
          magenta: "var(--series-magenta)",
        },
        good: "var(--good)",
        warning: "var(--warning)",
        critical: "var(--critical)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
      borderColor: {
        DEFAULT: "var(--border)",
        strong: "var(--border-strong)",
      },
      screens: {
        xs: "480px",
      },
    },
  },
  plugins: [],
};
export default config;
