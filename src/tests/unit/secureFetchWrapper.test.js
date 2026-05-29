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
    localStorage.clear();
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

  it("espera el token de otra pestana si ya hay un refresh fallback activo", async () => {
    let storedToken = "expired-token";
    getTokenMock.mockImplementation(() => storedToken);
    localStorage.setItem(
      "auth-refresh-lock:fallback",
      JSON.stringify({
        owner: "other-tab",
        expiresAt: Date.now() + 10000,
      }),
    );
    globalThis.fetch = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ message: "expired" }), { status: 401 }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ success: true }), { status: 200 }),
      );

    const { secureFetch } = await import("../../utils/secureFetchWrapper");
    const responsePromise = secureFetch("/event/getAllTypes");

    setTimeout(() => {
      storedToken = "token-from-other-tab";
      localStorage.setItem("token", storedToken);
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "token",
          newValue: storedToken,
        }),
      );
    }, 0);

    const response = await responsePromise;

    expect(response.status).toBe(200);
    expect(refreshSessionServiceMock).not.toHaveBeenCalled();
    expect(globalThis.fetch).toHaveBeenCalledTimes(2);

    const retryHeaders = globalThis.fetch.mock.calls[1][1].headers;
    expect(retryHeaders.get("Authorization")).toBe(
      "Bearer token-from-other-tab",
    );
  });

  it("agrupa refresh concurrentes sin navigator.locks en una sola llamada", async () => {
    let storedToken = "expired-token";
    let resolveRefresh;
    getTokenMock.mockImplementation(() => storedToken);
    refreshSessionServiceMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRefresh = () => {
            storedToken = "shared-new-token";
            resolve({ data: { token: storedToken } });
          };
        }),
    );
    globalThis.fetch = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ message: "expired" }), { status: 401 }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ message: "expired" }), { status: 401 }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ success: true }), { status: 200 }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ success: true }), { status: 200 }),
      );

    const { secureFetch } = await import("../../utils/secureFetchWrapper");
    const requests = Promise.all([
      secureFetch("/event/getAllTypes"),
      secureFetch("/absence/types"),
    ]);

    await new Promise((resolve) => setTimeout(resolve, 75));
    resolveRefresh();

    const responses = await requests;

    expect(responses.map((response) => response.status)).toEqual([200, 200]);
    expect(refreshSessionServiceMock).toHaveBeenCalledTimes(1);
    expect(globalThis.fetch).toHaveBeenCalledTimes(4);
  });
});
