import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const getTokenMock = vi.fn();
const refreshSessionServiceMock = vi.fn();

vi.mock("../../utils/authStorage", () => ({
  getToken: () => getTokenMock(),
}));

vi.mock("../../services/authService", () => ({
  refreshSessionService: () => refreshSessionServiceMock(),
}));

describe("secureFetch", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    Object.defineProperty(globalThis.navigator, "locks", {
      configurable: true,
      value: undefined,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renueva la sesion sin navigator.locks y reintenta la peticion", async () => {
    getTokenMock.mockReturnValue("expired-token");
    refreshSessionServiceMock.mockResolvedValue({
      data: { token: "new-token" },
    });
    globalThis.fetch = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ message: "expired" }), { status: 401 }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ success: true }), { status: 200 }),
      );

    const { secureFetch } = await import("../../utils/secureFetchWrapper");

    const response = await secureFetch("/event/getAllTypes");

    expect(response.status).toBe(200);
    expect(refreshSessionServiceMock).toHaveBeenCalledTimes(1);
    expect(globalThis.fetch).toHaveBeenCalledTimes(2);

    const retryHeaders = globalThis.fetch.mock.calls[1][1].headers;
    expect(retryHeaders.get("Authorization")).toBe("Bearer new-token");
  });
});
