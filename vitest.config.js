import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  
  resolve: {
    alias: {
      "/error.svg": path.resolve(__dirname, "./src/tests/__mocks__/svgMock.js"),
      "/check.svg": path.resolve(__dirname, "./src/tests/__mocks__/svgMock.js"),
      "/showEye.svg": path.resolve(__dirname, "./src/tests/__mocks__/svgMock.js"),
      "/hideEye.svg": path.resolve(__dirname, "./src/tests/__mocks__/svgMock.js"),
    },
  },

  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./vitest.setup.js",

    environmentOptions: {
      jsdom: {
        url: "http://localhost",
      },
    },

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
});