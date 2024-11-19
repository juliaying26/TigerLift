/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        theme_light_1: "#ECE3EC",
        theme_medium_1: "#C8A2C8",
        theme_dark_1: "#594559",
        theme_light_2: "#C4E5E3",
        theme_medium_2: "#5AAFAA",
        theme_dark_2: "#145F5B",
      },
    },
  },
  plugins: [],
};
