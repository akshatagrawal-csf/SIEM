/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        siem: {
          bg: '#0B0C10',
          secondary: '#0F1017',
          card: '#13141C',
          border: '#1E202E',
          hover: '#1B1D2A',
          cyan: '#3B82F6',       /* Enterprise Blue Accent */
          emerald: '#10B981',    /* Enterprise Emerald */
          purple: '#6366F1',     /* Enterprise Indigo */
          green: '#10B981',      /* Success Green */
          orange: '#F97316',     /* High Risk Orange */
          critical: '#EF4444',   /* Critical Red */
          high: '#F97316',       /* High Orange */
          medium: '#F59E0B',     /* Medium Amber */
          low: '#10B981',        /* Low Green */
          text: '#F9FAFB',
          secondaryText: '#9CA3AF',
          muted: '#6B7280',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Inter', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px -1px rgba(0, 0, 0, 0.2)',
        'panel': '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.3)',
      },
    },
  },
  plugins: [],
};
