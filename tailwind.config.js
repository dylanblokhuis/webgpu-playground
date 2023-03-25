/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        "mono": ["Ioveska", "Consolas", "monospace"],
      }
    },
  },
  plugins: [],
}
