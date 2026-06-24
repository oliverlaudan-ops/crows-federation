import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        crow: {
          ink: "#0a0a0d",      // Deepest black, the void before feathers
          feather: "#16161c",   // Card / panel background
          bone: "#e8e1d0",      // Bone-white text, parchment
          boneDim: "#9b958a",
          ash: "#3a3a44",      // Borders, dividers
          rust: "#7a3e1d",     // Blood-rust accent
          blood: "#8a1c2b",     // Crimson highlights
          owl: "#c9a961",       // The owl's gold, enemy accent
          crowblue: "#3b6e8f",  // Trustworthy crow blue (CTAs)
        },
      },
      fontFamily: {
        serif: ["'Cormorant Garamond'", "Georgia", "serif"],
        gothic: ["'UnifrakturCook'", "'Cormorant Garamond'", "serif"],
        sans: ["system-ui", "sans-serif"],
      },
      backgroundImage: {
        "grain": "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/></svg>\")",
      },
      animation: {
        "feather-flutter": "featherFlutter 3s ease-in-out infinite",
        "caw-pulse": "cawPulse 2s ease-in-out infinite",
      },
      keyframes: {
        featherFlutter: {
          "0%, 100%": { transform: "rotate(-2deg)" },
          "50%": { transform: "rotate(2deg)" },
        },
        cawPulse: {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;