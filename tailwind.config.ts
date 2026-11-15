import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        elderly: {
          blue: "#1E3A8A",
          gold: "#D97706",
          green: "#059669",
          coral: "#E11D48",
          warmBg: "#FDFBF7",
          softCard: "#F8FAFC",
        },
      },
      fontSize: {
        "senior-xs": "1.125rem", // 18px
        "senior-sm": "1.25rem",  // 20px
        "senior-base": "1.5rem", // 24px
        "senior-lg": "1.875rem", // 30px
        "senior-xl": "2.25rem",  // 36px
        "senior-2xl": "3rem",    // 48px
      },
    },
  },
  plugins: [],
};
export default config;
