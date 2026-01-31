/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: '#0F172A',
        accent: '#3B82F6',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-up': {
          '0%': { opacity: '0', transform: 'translateY(30px) scale(0.95) rotateX(-10deg)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1) rotateX(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.6s ease-out forwards',
        'slide-in-up': 'slide-in-up 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
      }
    },
  },
  plugins: [],
}
