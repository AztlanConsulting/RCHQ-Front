import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../utils/secureFetchWrapper", () => ({
  secureFetch: vi.fn(),
}));

import { secureFetch } from "../../utils/secureFetchWrapper";

describe("logsService", () => {
  let getHouseLogsService;

  beforeEach(async () => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.stubEnv("VITE_API_URL", "http://api.test");
    ({ getHouseLogsService } = await import("../../services/logsService"));
  });

  it("obtiene los logs de casa con paginación", async () => {
    localStorage.setItem("token", "token-test");
    secureFetch.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        success: true,
        data: [{ logId: "log-1", action: "Empleado creado" }],
        totalPages: 3,
        currentPage: 2,
        totalRecords: 22,
      }),
    });

    const result = await getHouseLogsService(2, 10);

    expect(secureFetch).toHaveBeenCalledWith(
      "http://api.test/logs/house?page=2&limit=10",
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          Authorization: "Bearer token-test",
          "Content-Type": "application/json",
        }),
      }),
    );
    expect(result).toEqual({
      data: [{ logId: "log-1", action: "Empleado creado" }],
      totalPages: 3,
      currentPage: 2,
      totalRecords: 22,
    });
  });

  it("lanza error cuando no existe token", async () => {
    await expect(getHouseLogsService()).rejects.toThrow(
      "No se encontró token de sesión",
    );
  });

  it("lanza el error del backend cuando la respuesta no es exitosa", async () => {
    localStorage.setItem("token", "token-test");
    secureFetch.mockResolvedValue({
      ok: false,
      status: 422,
      json: vi.fn().mockResolvedValue({
        message: "Parámetros inválidos",
      }),
    });

    await expect(getHouseLogsService(0, 10)).rejects.toThrow(
      "Parámetros inválidos",
    );
  });
});
