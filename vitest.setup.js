import "@testing-library/jest-dom";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

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
vi.mock("/add.svg", () => ({ default: "add.svg" }));
vi.mock("/edit.svg", () => ({ default: "edit.svg" }));
vi.mock("/close.svg", () => ({ default: "close.svg" }));

const localStorageMock = (function () {
  let store = {};
  return {
    getItem: function (key) { return store[key] || null; },
    setItem: function (key, value) { store[key] = value.toString(); },
    removeItem: function (key) { delete store[key]; },
    clear: function () { store = {}; },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
