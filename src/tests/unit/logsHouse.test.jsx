import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import LogsHouse from "../../pages/logsHouse";

vi.mock("../../hooks/pages/useHouseLogs", () => ({
  useHouseLogs: vi.fn(),
}));

import { useHouseLogs } from "../../hooks/pages/useHouseLogs";

describe("LogsHouse", () => {
  it("renderiza el título, filtros, tabla y paginación", () => {
    useHouseLogs.mockReturnValue({
      logs: [
        {
          logId: "log-1",
          responsibleName: "Luis Martínez",
          responsibleCurp: "MALR900205HDFRRS09",
          action: "Empleado creado",
          affectedName: "Juan Pérez",
          ipAddress: "10.10.10.10",
          moment: "2026-04-10T12:00:00.000Z",
        },
      ],
      totalLogs: 1,
      totalPages: 1,
      page: 1,
      loading: false,
      error: "",
      responsibleQuery: "",
      setResponsibleQuery: vi.fn(),
      affectedQuery: "",
      setAffectedQuery: vi.fn(),
      actionFilter: "all",
      setActionFilter: vi.fn(),
      dateFilter: "",
      setDateFilter: vi.fn(),
      actionOptions: [{ value: "all", label: "Todas las acciones" }],
      handleNextPage: vi.fn(),
      handlePrevPage: vi.fn(),
    });

    render(<LogsHouse />);

    expect(
      screen.getByText("Acciones registradas dentro de app de la casa"),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Buscar por Nombre del responsable"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("combobox", { name: "Filtrar por Acción" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Nombre del responsable")).toBeInTheDocument();
    expect(screen.getByText(/Página 1 de 1/)).toBeInTheDocument();
  });

  it("muestra estado vacío cuando no hay registros", () => {
    useHouseLogs.mockReturnValue({
      logs: [],
      totalLogs: 0,
      totalPages: 0,
      page: 1,
      loading: false,
      error: "",
      responsibleQuery: "",
      setResponsibleQuery: vi.fn(),
      affectedQuery: "",
      setAffectedQuery: vi.fn(),
      actionFilter: "all",
      setActionFilter: vi.fn(),
      dateFilter: "",
      setDateFilter: vi.fn(),
      actionOptions: [{ value: "all", label: "Todas las acciones" }],
      handleNextPage: vi.fn(),
      handlePrevPage: vi.fn(),
    });

    render(<LogsHouse />);

    expect(
      screen.getByText("No hay registros para los filtros seleccionados"),
    ).toBeInTheDocument();
  });

  it("muestra error cuando falla la carga", () => {
    useHouseLogs.mockReturnValue({
      logs: [],
      totalLogs: 0,
      totalPages: 0,
      page: 1,
      loading: false,
      error: "Error al cargar",
      responsibleQuery: "",
      setResponsibleQuery: vi.fn(),
      affectedQuery: "",
      setAffectedQuery: vi.fn(),
      actionFilter: "all",
      setActionFilter: vi.fn(),
      dateFilter: "",
      setDateFilter: vi.fn(),
      actionOptions: [{ value: "all", label: "Todas las acciones" }],
      handleNextPage: vi.fn(),
      handlePrevPage: vi.fn(),
    });

    render(<LogsHouse />);

    expect(screen.getByText("Error: Error al cargar")).toBeInTheDocument();
  });
});
