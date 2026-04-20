// vitest.config.js
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./vitest.setup.js",

    include: [
      "src/tests/unit/**/*.test.{js,jsx}",       // ← ajustar según tu estructura
      "src/tests/integration/**/*.test.{js,jsx}",
    ],

    coverage: {
      reporter: ["text", "html"],
      reportsDirectory: "./coverage",
    },

    testTimeout: 10000,
  },
});