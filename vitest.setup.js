import "@testing-library/jest-dom";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

// Mock SVG imports
vi.mock("/error.svg", () => ({ default: "error.svg" }));
vi.mock("/check.svg", () => ({ default: "check.svg" }));
vi.mock("/showEye.svg", () => ({ default: "showEye.svg" }));
vi.mock("/hideEye.svg", () => ({ default: "hideEye.svg" }));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
