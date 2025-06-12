/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/ui/**/*.{tsx,ts,js,jsx}"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  presets: [require("./src/ui/tailwind.config.js")]
}
