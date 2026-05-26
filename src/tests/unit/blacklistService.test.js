import { describe, it, expect, vi, beforeEach } from "vitest";
import { getBlacklist, addToBlacklist, removeFromBlacklist } from "../../services/blacklistService";
import { secureFetch } from "../../utils/secureFetchWrapper";

vi.mock("../../utils/secureFetchWrapper", () => ({
  secureFetch: vi.fn(),
}));

describe("blacklistService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem("token", "mock-token");
  });

  describe("getBlacklist", () => {
    it("llama a secureFetch con los parámetros correctos", async () => {
      secureFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, employees: [], pagination: {} }),
      });

      await getBlacklist(1, 10, "CURP123", "true");
      
      expect(secureFetch).toHaveBeenCalledWith(
        expect.stringContaining("page=1&limit=10&curp=CURP123&isBlacklisted=true"),
        expect.objectContaining({ method: "GET" })
      );
    });

    it("lanza un error si la respuesta no es exitosa", async () => {
      secureFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: "Error interno" }),
      });

      await expect(getBlacklist()).rejects.toThrow("Error interno");
    });
  });

  describe("addToBlacklist", () => {
    it("llama a secureFetch con los datos y headers correctos", async () => {
      secureFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, message: "Añadido" }),
      });

      await addToBlacklist("CURP123", "Razón de prueba");

      expect(secureFetch).toHaveBeenCalledWith(
        expect.stringContaining("/blacklist"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ curp: "CURP123", reason: "Razón de prueba" }),
          headers: expect.objectContaining({
            "Content-Type": "application/json",
          }),
        })
      );
    });
  });

  describe("removeFromBlacklist", () => {
    it("llama a secureFetch con los datos y headers correctos", async () => {
      secureFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, message: "Eliminado" }),
      });

      await removeFromBlacklist("CURP123", "Razón de prueba");

      expect(secureFetch).toHaveBeenCalledWith(
        expect.stringContaining("/blacklist/delete"),
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify({ curp: "CURP123", reason: "Razón de prueba" }),
          headers: expect.objectContaining({
            "Content-Type": "application/json",
          }),
        })
      );
    });
  });
});