import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import HouseLogsTable from "../../components/molecules/houseLogsTable";

vi.mock("../../hooks/pages/useHouseLogs", () => ({
  formatLogMoment: vi.fn(() => "10/04/2026 a las 12:00 pm"),
}));

describe("HouseLogsTable", () => {
  const logs = [
    {
      logId: "log-1",
      responsibleName: "Luis Martínez",
      responsibleCurp: "MALR900205HDFRRS09",
      action: "Empleado creado",
      affectedName: "Juan Pérez",
      ipAddress: "10.10.10.10",
      moment: "2026-04-10T12:00:00.000Z",
    },
  ];

  it("mantiene la tabla visible mientras actualiza una búsqueda", () => {
    render(<HouseLogsTable logs={logs} loading error="" />);

    expect(screen.getByText("Nombre del responsable")).toBeInTheDocument();
    expect(screen.getAllByText("Luis Martínez").length).toBeGreaterThan(0);
    expect(screen.getByText("Actualizando registros...")).toBeInTheDocument();
  });
});
