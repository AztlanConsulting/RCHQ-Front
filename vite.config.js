import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import flowbiteReact from "flowbite-react/plugin/vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isVitest = process.env.VITEST === "true";

export default defineConfig({
  plugins: [react(), tailwindcss(), !isVitest && flowbiteReact()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
