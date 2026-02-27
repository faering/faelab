/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Light theme colors (unchanged)
        primary: {
          DEFAULT: '#f3f4f6', // bg-white, bg-purple-50, etc.
          accent: '#e0bbff', // pastel accent
        },
        secondary: {
          DEFAULT: '#e0bbff', // pastel purple
        },
        text: {
          DEFAULT: '#18181b', // text-slate-800
          muted: '#64748b',   // text-slate-600
        },
        // Add more as needed for your palette
        // Dark theme colors
        dark: {
          bg: '#18181b',
          accent: '#7c3aed',
          text: '#f3f4f6',
          muted: '#a1a1aa',
        },
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-up': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        'scale-up': 'scale-up 0.2s ease-out',
      },
    },
  },
  plugins: [],
};
