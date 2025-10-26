/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./App.tsx",
    "./firebase.ts",
    "./index.css",
    "./index.tsx",
    "./types.ts",
    "./components/**/*.tsx",
    "./context/**/*.tsx",
    "./data/**/*.ts",
    "./pages/**/*.tsx",
  ],
  theme: {
    extend: {
      colors: {
        'header-blue': '#2c3e50',
        'button-blue': '#3498db',
      }
    },
  },
  plugins: [],
}
