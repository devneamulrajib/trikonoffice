/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        trikonOrange: '#F9A825',
        trikonBlack: '#212121',
      }
    },
  },
  plugins: [],
}