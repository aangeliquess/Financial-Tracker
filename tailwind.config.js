/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class", // enable dark mode via adding/removing the `dark` class
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      container: {
        center: true,
        padding: "1rem",
      },
      borderRadius: {
        "2xl": "1rem",
      },
      boxShadow: {
        card: "0 8px 20px -10px rgba(2,6,23,0.18)",
      },
    },
  },
  plugins: [],
}
