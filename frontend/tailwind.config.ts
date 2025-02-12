import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#800000', // maroon from your gradient
          accent: '#ccffff',  // light cyan from your gradient
          muted: '#D7CAEC'    // light purple from your gradient
        },
        dark: {
          DEFAULT: '#000000', // pure black background
          surface: '#111111', // slightly lighter black for cards
          lighter: '#222222'  // even lighter for hover states
        },
        light: {
          DEFAULT: '#FFFFFF',
          muted: '#D8CBED'    // from your HERO_SVG_BOTTOM
        }
      },
      backgroundImage: {
        'hero-gradient-top': 'linear-gradient(to top left, #ccffff 22%, #800000 87%)',
        'hero-gradient-bottom': 'linear-gradient(180deg, #FFFFFF 22%, #D7CAEC 100%)',
      },
      boxShadow: {
        'modern': '0 4px 20px rgba(0, 0, 0, 0.25)',
        'glow': '0 0 20px rgba(128, 0, 0, 0.2)' // maroon glow
      }
    },
  },
  plugins: [],
};

export default config;