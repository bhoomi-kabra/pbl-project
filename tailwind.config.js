/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        municipal: {
          navy: '#0f172a',
          navyDark: '#0b1120',
          slate: '#1e293b',
          blue: '#2563eb',
          sky: '#0284c7',
          emerald: '#10b981',
          emeraldDark: '#059669',
          amber: '#f59e0b',
          crimson: '#ef4444',
          lightBg: '#f8fafc',
          card: '#ffffff'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(15, 23, 42, 0.08)',
        'glow-emerald': '0 0 20px rgba(16, 185, 129, 0.35)',
        'glow-blue': '0 0 20px rgba(37, 99, 235, 0.35)',
      }
    },
  },
  plugins: [],
}
