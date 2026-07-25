/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // "Darkroom" palette — warm charcoal surfaces with an amber safelight accent
        ink: {
          950: '#14130F',
          900: '#1C1B17',
          800: '#26241F',
          700: '#34312A',
          600: '#4A463C',
        },
        paper: {
          100: '#F5F1E6',
          200: '#EAE4D3',
          300: '#D8CFB8',
        },
        safelight: {
          400: '#F0B454',
          500: '#E8A33D',
          600: '#C6832A',
        },
        teal: {
          400: '#4E9C9A',
          500: '#3E7C7B',
          600: '#2F5F5E',
        },
        danger: {
          500: '#C1503F',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        card: '10px',
      },
      boxShadow: {
        sprocket: 'inset 0 6px 0 -4px rgba(232, 163, 61, 0.35)',
      },
    },
  },
  plugins: [],
};
