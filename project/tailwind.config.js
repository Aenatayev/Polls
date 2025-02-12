/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  plugins: [],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff1fb',
          100: '#ffe4f7',
          200: '#ffc9ef',
          300: '#ff9fe0',
          400: '#ff65c9',
          500: '#ff33b8',
          600: '#ff1fae',
          700: '#e6008f',
          800: '#bd0076',
          900: '#9c0061'
        },
        secondary: {
          50: '#fefee8',
          100: '#fffdc2',
          200: '#fff886',
          300: '#ffeb46',
          400: '#ffdb1b',
          500: '#ffc107',
          600: '#e29400',
          700: '#bb6902',
          800: '#985108',
          900: '#7c420b'
        },
        accent: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e'
        }
      }
    },
  },
  plugins: [],
};