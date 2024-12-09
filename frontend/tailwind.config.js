/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        theme_light_1: "#f0e9e4",
        theme_medium_1: "#89A8B2",
        theme_dark_1: "#B3C8CF",
        theme_light_2: "#B3C8CF",
        theme_medium_2: "#839ba3",
        theme_dark_2: "#F1F0E8",
        info_light: "#bdced4",
      },
    },
  },
  plugins: [],
};
