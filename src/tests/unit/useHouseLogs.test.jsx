import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../services/logsService", () => ({
  getHouseLogsService: vi.fn(),
  getLogsActionsService: vi.fn().mockResolvedValue([]),
  downloadHouseLogsReportService: vi.fn(),
}));

import { getHouseLogsService, getLogsActionsService } from "../../services/logsService";
import { useHouseLogs } from "../../hooks/pages/useHouseLogs";

const baseLogs = [
  {
    logId: "log-1",
    responsibleName: "Luis Martínez",
    responsibleCurp: "MALR900205HDFRRS09",
    action: "Empleado creado",
    affectedName: "Juan Pérez",
    ipAddress: "10.10.10.10",
    moment: "2026-04-10T12:00:00.000Z",
  },
  {
    logId: "log-2",
    responsibleName: "Carla Coord",
    responsibleCurp: "COOC900101MDFABC01",
    action: "Cambio de contraseña",
    affectedName: "Luis Martínez",
    ipAddress: "10.10.10.11",
    moment: "2026-04-11T08:00:00.000Z",
  },
  {
    logId: "log-3",
    responsibleName: "Carla Coord",
    responsibleCurp: "COOC900101MDFABC01",
    action: "Eliminar ausencia",
    affectedName: "Ana López",
    ipAddress: "10.10.10.12",
    moment: "2026-04-11T09:00:00.000Z",
  },
];

describe("useHouseLogs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getLogsActionsService.mockResolvedValue([]);
  });

  it("carga los logs y deja vacío el catálogo de acciones cuando no hay datos", async () => {
    getHouseLogsService.mockResolvedValue({
      logs: baseLogs,
      pagination: {
        page: 1,
        limit: 6,
        total: 3,
        totalPages: 1,
      },
      data: baseLogs,
      totalPages: 1,
      currentPage: 1,
      totalRecords: 3,
    });

    const { result } = renderHook(() => useHouseLogs());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.logs).toHaveLength(3);
    expect(result.current.actionOptions).toEqual([]);
    expect(result.current.selectedActionLabel).toBe("Todas las acciones");
  });

  it("mantiene el estado base de filtros sin afectar la carga", async () => {
    getHouseLogsService.mockResolvedValue({
      data: baseLogs,
      logs: baseLogs,
      pagination: {
        page: 1,
        limit: 6,
        total: 3,
        totalPages: 1,
      },
      totalPages: 1,
      currentPage: 1,
      totalRecords: 3,
    });

    const { result } = renderHook(() => useHouseLogs());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.setResponsibleQuery("carla");
      result.current.setAffectedQuery("ana");
      result.current.setActionFilter("ausn-001");
      result.current.setDateFilter("2026-04-11");
    });

    expect(result.current.responsibleQuery).toBe("carla");
    expect(result.current.affectedQuery).toBe("ana");
    expect(result.current.actionFilter).toBe("ausn-001");
    expect(result.current.dateFilter).toBe("2026-04-11");
  });

  it("pagina los resultados desde el servidor", async () => {
    const pageOneLogs = Array.from({ length: 6 }, (_, index) => ({
      logId: `log-${index + 1}`,
      responsibleName: `Responsable ${index + 1}`,
      responsibleCurp: `CURP${index + 1}`,
      action: "Empleado creado",
      affectedName: `Afectado ${index + 1}`,
      ipAddress: `10.10.10.${index + 1}`,
      moment: "2026-04-10T12:00:00.000Z",
    }));
    const pageTwoLogs = Array.from({ length: 2 }, (_, index) => ({
      logId: `log-${index + 7}`,
      responsibleName: `Responsable ${index + 7}`,
      responsibleCurp: `CURP${index + 7}`,
      action: "Empleado creado",
      affectedName: `Afectado ${index + 7}`,
      ipAddress: `10.10.10.${index + 7}`,
      moment: "2026-04-10T12:00:00.000Z",
    }));

    getHouseLogsService
      .mockResolvedValueOnce({
        data: pageOneLogs,
        logs: pageOneLogs,
        pagination: {
          page: 1,
          limit: 6,
          total: 8,
          totalPages: 2,
        },
        totalPages: 2,
        currentPage: 1,
        totalRecords: 8,
      })
      .mockResolvedValueOnce({
        data: pageTwoLogs,
        logs: pageTwoLogs,
        pagination: {
          page: 2,
          limit: 6,
          total: 8,
          totalPages: 2,
        },
        totalPages: 2,
        currentPage: 2,
        totalRecords: 8,
      });

    const { result } = renderHook(() => useHouseLogs());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.logs).toHaveLength(6);
    expect(result.current.totalPages).toBe(2);

    act(() => {
      result.current.handleNextPage();
    });

    await waitFor(() => {
      expect(result.current.page).toBe(2);
      expect(result.current.logs).toHaveLength(2);
    });
  });

  it("expone el error cuando el servicio falla", async () => {
    getHouseLogsService.mockRejectedValue(new Error("No autorizado"));

    const { result } = renderHook(() => useHouseLogs());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe("No autorizado");
    expect(result.current.logs).toEqual([]);
  });

  it("manda responsible y affected al backend después del debounce", async () => {
    getHouseLogsService.mockResolvedValue({
      logs: baseLogs,
      pagination: {
        page: 1,
        limit: 6,
        total: 3,
        totalPages: 1,
      },
      data: baseLogs,
      totalPages: 1,
      currentPage: 1,
      totalRecords: 3,
    });

    const { result } = renderHook(() => useHouseLogs());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.setResponsibleQuery("Carla");
      result.current.setAffectedQuery("Luis");
    });

    await waitFor(() => {
      expect(getHouseLogsService).toHaveBeenLastCalledWith(
        expect.objectContaining({
          responsible: "Carla",
          affected: "Luis",
        }),
      );
    });
  });
});
