// tailwind.config.ts
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'custom-blue': '#377DFF',
      },
    },
  },
  darkMode: 'class', // Enable dark mode using class
  plugins: [],
}
