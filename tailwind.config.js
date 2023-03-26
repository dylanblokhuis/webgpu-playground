/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    container: {
      center: true
    },
    extend: {
      fontFamily: {
        "mono": ["Ioveska", "Consolas", "monospace"],
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
