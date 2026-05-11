/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'rgb(var(--clr-primary) / <alpha-value>)',
          container: 'rgb(var(--clr-primary-container) / <alpha-value>)',
        },
        secondary: {
          DEFAULT: 'rgb(var(--clr-secondary) / <alpha-value>)',
        },
        tertiary: {
          DEFAULT: 'rgb(var(--clr-tertiary) / <alpha-value>)',
        },
        surface: {
          DEFAULT: 'rgb(var(--clr-surface) / <alpha-value>)',
          container: 'rgb(var(--clr-surface-container) / <alpha-value>)',
        },
        'on-surface': {
          DEFAULT: 'rgb(var(--clr-on-surface) / <alpha-value>)',
          variant: 'rgb(var(--clr-on-surface-variant) / <alpha-value>)',
        },
        error: {
          DEFAULT: 'rgb(var(--clr-error) / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
