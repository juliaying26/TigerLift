import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://localhost:3100", // our Flask port
      "/login": "http://localhost:3100",
      "/logout": "http://localhost:3100",
    },
  },
});
