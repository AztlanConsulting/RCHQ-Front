import "@testing-library/jest-dom";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

// Mock SVG imports
vi.mock("/error.svg", () => ({ default: "error.svg" }));
vi.mock("/check.svg", () => ({ default: "check.svg" }));
vi.mock("/showEye.svg", () => ({ default: "showEye.svg" }));
vi.mock("/hideEye.svg", () => ({ default: "hideEye.svg" }));
vi.mock("/document.svg", () => ({ default: "document.svg" }));
vi.mock("/absence-black.svg", () => ({ default: "absence-black.svg" }));
vi.mock("/global-black.svg", () => ({ default: "global-black.svg" }));
vi.mock("/house-black.svg", () => ({ default: "house-black.svg" }));
vi.mock("/personal-black.svg", () => ({ default: "personal-black.svg" }));
vi.mock("/vacation-black.svg", () => ({ default: "vacation-black.svg" }));
vi.mock("/time.svg", () => ({ default: "time.svg" }));
vi.mock("/chevron-down.svg", () => ({ default: "chevron-down.svg" }));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
