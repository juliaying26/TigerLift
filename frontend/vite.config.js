import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const productionSettings = {
  port: 3000,
  host: "0.0.0.0",
};

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  server: {
    ...(command === "serve" ? {} : productionSettings), // Only apply production settings when not in dev
    proxy: {
      "/api": {
        target: "https://tigerlift.onrender.com/" || "http://localhost:3100",
        changeOrigin: true,
      },
    },
  },
  preview: productionSettings,
}));
