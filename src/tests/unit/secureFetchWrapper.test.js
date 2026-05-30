import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const getTokenMock = vi.fn();
const refreshSessionServiceMock = vi.fn();

vi.mock("../../utils/authStorage", () => ({
  getToken: () => getTokenMock(),
}));

vi.mock("../../services/sessionService", () => ({
  refreshSessionService: () => refreshSessionServiceMock(),
}));

describe("secureFetch", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renueva la sesion y reintenta la peticion", async () => {
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

  it("espera un refresh en curso antes de enviar nuevas peticiones", async () => {
    let resolveRefresh;
    let storedToken = "expired-token";
    getTokenMock.mockImplementation(() => storedToken);
    refreshSessionServiceMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRefresh = () => {
            storedToken = "shared-fresh-token";
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
        new Response(JSON.stringify({ success: true }), { status: 200 }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ success: true }), { status: 200 }),
      );

    const { secureFetch } = await import("../../utils/secureFetchWrapper");
    const firstRequest = secureFetch("/event/getAllTypes");

    await new Promise((resolve) => setTimeout(resolve, 75));
    const secondRequest = secureFetch("/absence/types");

    await new Promise((resolve) => setTimeout(resolve, 75));
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);

    resolveRefresh();

    const responses = await Promise.all([firstRequest, secondRequest]);

    expect(responses.map((response) => response.status)).toEqual([200, 200]);
    expect(refreshSessionServiceMock).toHaveBeenCalledTimes(1);
    expect(globalThis.fetch).toHaveBeenCalledTimes(3);

    const retryHeaders = globalThis.fetch.mock.calls[1][1].headers;
    const secondHeaders = globalThis.fetch.mock.calls[2][1].headers;
    expect(retryHeaders.get("Authorization")).toBe("Bearer shared-fresh-token");
    expect(secondHeaders.get("Authorization")).toBe("Bearer shared-fresh-token");
  });

  it("reintenta con el token actual si otro flujo ya lo actualizo", async () => {
    getTokenMock
      .mockReturnValueOnce("expired-token")
      .mockReturnValueOnce("token-from-other-flow");
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
    expect(refreshSessionServiceMock).not.toHaveBeenCalled();
    expect(globalThis.fetch).toHaveBeenCalledTimes(2);

    const retryHeaders = globalThis.fetch.mock.calls[1][1].headers;
    expect(retryHeaders.get("Authorization")).toBe(
      "Bearer token-from-other-flow",
    );
  });

  it("agrupa refresh concurrentes en una sola llamada", async () => {
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
