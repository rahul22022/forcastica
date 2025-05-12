
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4F46E5',
          dark: '#4338CA'
        },
        secondary: '#10B981',
        accent: '#F59E0B',
        background: '#111827',
        foreground: '#F9FAFB'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif']
      },
      animation: {
        'gradient': 'gradient 15s ease infinite',
      },
      keyframes: {
        gradient: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        }
      }
    },
  },
  plugins: [],
};
