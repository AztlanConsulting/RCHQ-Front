import "@testing-library/jest-dom";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

// Mock SVG imports
vi.mock("/error.svg", () => ({ default: "error.svg" }));
vi.mock("/check.svg", () => ({ default: "check.svg" }));
vi.mock("/showEye.svg", () => ({ default: "showEye.svg" }));
vi.mock("/employee.svg", () => ({ default: "employee.svg" }));
vi.mock("/vacation.svg", () => ({ default: "vacation.svg" }));
vi.mock("/absences.svg", () => ({ default: "absences.svg" }));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
