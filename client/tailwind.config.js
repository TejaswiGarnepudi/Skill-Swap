/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        plum: {
          950: '#0D0A11',
          900: '#17121C',
          800: '#2A1F33',
          700: '#3D2E4A',
          600: '#503D61',
          500: '#634C78',
        },
        violet: {
          600: '#7C3AED',
          500: '#9B5DE5',
          400: '#B07FEE',
          300: '#C8A6F5',
          200: '#DCC8FA',
          100: '#EDE5F7',
        },
        coral: {
          600: '#E84545',
          500: '#FF6B6B',
          400: '#FF8E8E',
          300: '#FFB3B3',
          200: '#FFD4D4',
          100: '#FFF0F0',
        },
        lavender: {
          50: '#FDFCFE',
          100: '#F7F3FA',
          200: '#EDE5F3',
          300: '#C8B6D9',
          400: '#A98FC0',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(23, 18, 28, 0.07), 0 10px 20px -2px rgba(23, 18, 28, 0.04)',
        'card': '0 1px 3px rgba(23, 18, 28, 0.05), 0 1px 2px rgba(23, 18, 28, 0.03)',
        'hover': '0 4px 25px -5px rgba(155, 93, 229, 0.15), 0 10px 25px -5px rgba(23, 18, 28, 0.05)',
      },
    },
  },
  plugins: [],
};
