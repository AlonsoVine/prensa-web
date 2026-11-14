import { defineConfig } from "vite";

const PUERTO = 4173;

export default defineConfig({
  base: "./",
  server: { port: 5173 },
  preview: { port: PUERTO, strictPort: true },
  build: {
    target: "es2022",
    sourcemap: false,
    assetsInlineLimit: 0,
  },
});
