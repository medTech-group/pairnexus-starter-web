import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Builds the page into dist/, which wrangler.toml serves as the Worker's assets.
export default defineConfig({
  plugins: [react()],
  build: { outDir: "dist", emptyOutDir: true },
});
