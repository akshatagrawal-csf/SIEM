/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        siem: {
          bg: '#000000',
          secondary: '#080808',
          card: 'rgba(18, 18, 18, 0.85)',
          border: 'rgba(255, 255, 255, 0.1)',
          hover: 'rgba(255, 255, 255, 0.07)',
          gold: '#FFB800',       /* Cyber Gold / Amber */
          cyan: '#FFB800',       /* Alias to Gold for zero blue */
          emerald: '#00FF9D',    /* Neon Emerald */
          blue: '#00FF9D',       /* Alias to Emerald */
          purple: '#00FF9D',     /* Alias to Emerald */
          green: '#00FF9D',      /* Neon Emerald */
          orange: '#FF7700',     /* Cyber Orange */
          critical: '#FF2255',   /* Neon Crimson Red */
          high: '#FF7700',       /* Cyber Orange */
          medium: '#FFB800',     /* Cyber Gold */
          low: '#00FF9D',        /* Neon Emerald */
          text: '#FFFFFF',
          secondaryText: '#A1A1AA',
          muted: '#71717A',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      boxShadow: {
        'glow-cyan': '0 0 25px rgba(255, 184, 0, 0.35)',
        'glow-gold': '0 0 25px rgba(255, 184, 0, 0.35)',
        'glow-critical': '0 0 25px rgba(255, 34, 85, 0.4)',
        'glow-emerald': '0 0 25px rgba(0, 255, 157, 0.35)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.85)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 20s linear infinite',
      }
    },
  },
  plugins: [],
};
