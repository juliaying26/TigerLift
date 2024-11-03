/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        theme_light: "#ECE3EC",
        theme_medium_1: "#C8A2C8",
        theme_dark_1: "#594559",
        theme_medium_2: "#217B76",
        theme_dark_2: "#217B76",
      },
    },
  },
  plugins: [],
};
