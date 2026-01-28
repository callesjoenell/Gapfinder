/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Teal green from https://say-it-with-a-song.vercel.app/ start button
        primary: {
          50: '#e6faf7',
          100: '#ccf5ef',
          200: '#99ebdf',
          300: '#66e0cf',
          400: '#33d6bf',
          500: '#00D5BE',  // Main teal - exact color from Say It With A Song
          600: '#00aa98',
          700: '#008072',
          800: '#00554c',
          900: '#002b26',
          950: '#001513',
        },
      },
    },
  },
  plugins: [],
}
