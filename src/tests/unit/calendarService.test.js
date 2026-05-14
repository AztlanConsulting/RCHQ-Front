import { describe, it, expect, vi, beforeEach } from "vitest";
import { secureFetch } from "../../utils/secureFetchWrapper";
import {
  getEventsTypes,
  getEventsInRange,
  getEmployeeHouseName,
  getOwnEmployeeId,
} from "../../services/calendarService";

vi.mock("../../utils/secureFetchWrapper", () => ({
  secureFetch: vi.fn(),
}));

vi.mock("../../utils/authStorage", () => ({
  getToken: vi.fn(),
  getStoredUser: vi.fn(),
}));

import { getToken, getStoredUser } from "../../utils/authStorage";

beforeEach(() => {
  vi.clearAllMocks();
});

const jsonResponse = (data) =>
  Promise.resolve({
    json: () => Promise.resolve(data),
  });

describe("getEventsTypes", () => {
  it("lanza si no hay token", async () => {
    getToken.mockReturnValue(null);
    await expect(getEventsTypes()).rejects.toThrow("No se encontró token de sesión");
  });

  it("retorna eventTypes del JSON", async () => {
    getToken.mockReturnValue("t1");
    const types = [{ name: "Capacitación" }];
    secureFetch.mockResolvedValue(jsonResponse({ data: { eventTypes: types } }));
    await expect(getEventsTypes()).resolves.toEqual(types);
    expect(secureFetch).toHaveBeenCalledWith(
      "http://test-api.local/event/getAllTypes",
      expect.objectContaining({ method: "GET" }),
    );
  });
});

describe("getEventsInRange", () => {
  it("retorna [] si employeeId vacío", async () => {
    await expect(getEventsInRange("", "2026-01-01", "2026-01-31")).resolves.toEqual([]);
  });

  it("lanza si no hay token", async () => {
    getToken.mockReturnValue(null);
    await expect(
      getEventsInRange("emp1", "2026-01-01", "2026-01-31"),
    ).rejects.toThrow("No se encontró token de sesión");
  });

  it("retorna events del body", async () => {
    getToken.mockReturnValue("t1");
    const events = [{ name: "A", start: "x", end: "y" }];
    globalThis.fetch = vi.fn().mockResolvedValue(
      jsonResponse({ data: { events } }),
    );
    await expect(
      getEventsInRange("e1", "2026-01-01", "2026-01-31"),
    ).resolves.toEqual(events);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      "http://test-api.local/event/range/e1/2026-01-01/2026-01-31",
      expect.any(Object),
    );
  });
});

describe("getEmployeeHouseName", () => {
  it("retorna houseName", async () => {
    getToken.mockReturnValue("t1");
    secureFetch.mockResolvedValue(jsonResponse({ data: { houseName: "Casa X" } }));
    await expect(getEmployeeHouseName()).resolves.toBe("Casa X");
  });
});

describe("getOwnEmployeeId (re-export)", () => {
  it("lee employeeId del usuario almacenado", () => {
    getStoredUser.mockReturnValue({ employeeId: "99" });
    expect(getOwnEmployeeId()).toBe("99");
  });
});
