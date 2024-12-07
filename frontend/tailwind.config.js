/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        theme_light_1: "#f7eeeb",
        theme_medium_1: "#f2773d",
        theme_dark_1: "#db5313",
        theme_light_2: "#E6E6EF",
        theme_medium_2: "#7794e0",
        theme_dark_2: "#3b64cf",
        info_light: "#FDF5EC",
      },
    },
  },
  plugins: [],
};
