import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",      // Sob APP folder er jinish
    "./components/**/*.{ts,tsx}", // Jodi baire components thake
    "./**/*.{ts,tsx}",          // UNIVERSAL SCAN (Sob khuje ber korbe)
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;