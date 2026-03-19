import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx,html}"],
  theme: {
    extend: {
      colors: {
        brand: "#f59e0b",
        "brand-dark": "#d97706",
      },
    },
  },
  plugins: [],
} satisfies Config;
