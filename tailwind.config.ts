import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#197fe6",
        "background-light": "#f6f7f8",
        "background-dark": "#111921",
        "card-dark": "#1d252f",
        "surface-dark": "#1c242c",
        "surface-light": "#ffffff",
        "text-secondary": "#9dabb8",
        "card-light": "#ffffff",
      },
      fontFamily: {
        display: ["var(--font-noto-sans-kr)", "var(--font-inter)", "sans-serif"],
        body: ["var(--font-noto-sans-kr)", "var(--font-inter)", "sans-serif"],
        sans: ["var(--font-noto-sans-kr)", "var(--font-inter)", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
        full: "9999px",
      },
    },
  },
  plugins: [],
};

export default config;

