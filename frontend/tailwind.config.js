/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        siem: {
          bg: '#111111',
          bgSecondary: '#161616',
          bgGradientFrom: '#111111',
          bgGradientTo: '#1A1A1A',
          card: '#181818',
          border: '#2A2A2A',
          hover: '#222222',
          orange: '#FF4F00',     /* Primary Accent: International Orange */
          yellow: '#FFD400',     /* Secondary Accent: Cyber Yellow */
          cyan: '#FF4F00',       /* Override legacy cyan references with Orange */
          emerald: '#CCFF00',    /* Electric Lime for Secure/Resolved */
          green: '#CCFF00',      /* Electric Lime */
          crimson: '#FF0033',    /* Critical Crimson Red */
          amber: '#FFB800',      /* High Amber */
          critical: '#FF0033',   /* Crimson Red */
          high: '#FFB800',       /* Amber */
          medium: '#FFD400',     /* Cyber Yellow */
          low: '#CCFF00',        /* Electric Lime */
          text: '#FFFFFF',
          secondaryText: '#CCCCCC',
          muted: '#888888',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Satoshi', 'sans-serif'],
        display: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Space Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'card': '0 2px 8px 0 rgba(0, 0, 0, 0.4)',
        'orange': '0 0 20px rgba(255, 79, 0, 0.35)',
        'yellow': '0 0 20px rgba(255, 212, 0, 0.25)',
      },
    },
  },
  plugins: [],
};
