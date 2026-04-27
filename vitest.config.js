// vitest.config.js
import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config.js";

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      // Avoid Vitest 4 `forks` pool worker start timeouts on Windows (see vitest#8861).
      pool: "vmThreads",
      environment: "jsdom",
      globals: true,
      setupFiles: "./vitest.setup.js",

      include: [
        "src/tests/unit/**/*.test.{js,jsx}",
        "src/tests/integration/**/*.test.{js,jsx}",
      ],

      coverage: {
        reporter: ["text", "html"],
        reportsDirectory: "./coverage",
      },

      testTimeout: 10000,
    },
  }),
);
