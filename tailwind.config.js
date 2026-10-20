/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        redPrimary: '#D32F2F',
        redDark: '#B71C1C',
        orangeSecondary: '#FF6B00',
        greenSuccess: '#2E7D32',
        darkBg: '#121212',
        darkSurface: '#1E1E1E',
        darkCard: '#282828',
      },
    },
  },
  plugins: [],
}
