// vitest.config.js
import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config.js";

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
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
