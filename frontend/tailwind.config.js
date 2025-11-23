/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6366f1',
          dark: '#4f46e5',
          light: '#818cf8'
        },
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444'
      },
      borderRadius: {
        'sm': '0.5rem',
        'DEFAULT': '0.75rem',
        'lg': '1rem',
        'xl': '1.5rem'
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
        'DEFAULT': '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        'md': '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
        'lg': '0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        'xl': '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
      }
    },
  },
  plugins: [],
}