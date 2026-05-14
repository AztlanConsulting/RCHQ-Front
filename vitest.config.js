// vitest.config.js
import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config.js";

export default mergeConfig(
  viteConfig,
  defineConfig({
    define: {
      "import.meta.env.VITE_API_URL": JSON.stringify("http://test-api.local"),
    },
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

      server: {
        deps: {
          inline: ["react-router", "react-router-dom", "react-router/dom"],
        },
      },
    },
  }),
);