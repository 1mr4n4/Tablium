/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Fraunces"', 'ui-serif', 'Georgia', 'serif'],
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        paper: {
          DEFAULT: '#F7F7F5',
          100: '#FFFFFF',
          200: '#EFEFEB',
        },
        ink: {
          DEFAULT: '#0F1115',
          800: '#14171C',
          700: '#1B1F26',
          600: '#5B6270',
          400: '#9AA1AC',
        },
        brand: {
          DEFAULT: '#1E3A5F',
          light: '#2F4F7A',
        },
        live: {
          DEFAULT: '#F2B705',
          dark: '#F2C94C',
        },
        session: {
          cours: '#3B6FD9',
          coursDark: '#7DA0F0',
          td: '#12897A',
          tdDark: '#3FCBB8',
          tp: '#B9740A',
          tpDark: '#E3A23C',
          examen: '#C0392B',
          examenDark: '#E86A5C',
          autre: '#6B7280',
          autreDark: '#9AA1AC',
        },
      },
      boxShadow: {
        glass: '0 1px 0 0 rgba(255,255,255,0.06) inset',
      },
      backdropBlur: {
        xs: '2px',
      },
      keyframes: {
        pulseDot: {
          '0%, 100%': { opacity: 1, transform: 'scale(1)' },
          '50%': { opacity: 0.5, transform: 'scale(0.85)' },
        },
      },
      animation: {
        pulseDot: 'pulseDot 1.8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
