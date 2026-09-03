/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        void: {
          DEFAULT: '#030014',
          light: '#07031e',
        },
        indigo: {
          glow: '#6366f1',
        },
        violet: {
          glow: '#a855f7',
        },
        magenta: {
          glow: '#d946ef',
        },
        cyan: {
          glow: '#06b6d4',
        },
      },
      animation: {
        'spin-slow': 'spin 20s linear infinite',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
