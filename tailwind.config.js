/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}","./index.html"],
  theme: {
    extend: {
      flex: {
        '2': '1 1 0%'
      }
    },
  },
  plugins: [],
};
