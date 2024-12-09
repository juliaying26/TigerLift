/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        theme_light_1: "#e7eefa",
        theme_medium_1: "#7ba9ed",
        theme_dark_1: "#3478da",
        theme_light_2: "#f7e6e4",
        theme_medium_2: "#F07F73",
        theme_dark_2: "#e34a39",
        info_light: "#FDF5EC",
        theme_light_3: "#f8eee0",
        theme_medium_3: "#f5a500",
        theme_bg: "#ededf6",
      },
    },
  },
  plugins: [],
};
