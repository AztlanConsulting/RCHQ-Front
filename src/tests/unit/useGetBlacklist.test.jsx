import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useGetBlacklist } from "../../hooks/pages/useGetBlacklist";
import { getBlacklist } from "../../services/blacklistService";

vi.mock("../../services/blacklistService", () => ({
  getBlacklist: vi.fn(),
}));

describe("useGetBlacklist", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("convierte una respuesta sin resultados en estado vacío, no en error", async () => {
    const error = new Error("No hay personas en la lista negra");
    error.status = 404;
    getBlacklist.mockRejectedValueOnce(error);

    const { result } = renderHook(() => useGetBlacklist());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeNull();
    expect(result.current.employees).toEqual([]);
    expect(result.current.pagination.total).toBe(0);
    expect(result.current.pagination.totalPages).toBe(0);
  });

  it("no hace fetch cuando el hook está deshabilitado", async () => {
    const { result } = renderHook(() => useGetBlacklist({ enabled: false }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(getBlacklist).not.toHaveBeenCalled();
    expect(result.current.employees).toEqual([]);
    expect(result.current.pagination.total).toBe(0);
  });
});
