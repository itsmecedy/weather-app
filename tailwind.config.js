/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}","./index.html"],
  theme: {
    extend: {
      flex: {
        '2': '2 2 0%'
      }
    },
  },
  plugins: [],
};
