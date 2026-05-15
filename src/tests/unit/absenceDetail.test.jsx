import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AbsenceDetail from "../../components/molecules/calendarCards/absenceDetail";

const absence = {
  eventType: "Médica",
  employeeName: "Laura Mendoza",
  curp: "MEML900101MDFNDR01",
  startDate: "2026-05-05",
  endDate: "2026-05-09",
  description: "Reposo médico",
  link: "",
  usedDays: 3,
};

describe("AbsenceDetail", () => {
  it("usa la vista de trabajador para roles no administrativos", () => {
    render(
      <AbsenceDetail
        event={absence}
        viewerRole="Mantenimiento"
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText("Ausencia")).toBeInTheDocument();
    expect(screen.getByText("Médica")).toBeInTheDocument();
    expect(screen.getByText("Sin evidencia")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cerrar/i })).toBeInTheDocument();
    expect(screen.queryByText("Nombre del trabajador")).not.toBeInTheDocument();
    expect(screen.queryByText("CURP")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /editar/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /eliminar/i })).not.toBeInTheDocument();
  });

  it("mantiene la vista administrativa para coordinador", () => {
    render(
      <AbsenceDetail
        event={absence}
        viewerRole="Coordinador"
        evidenceLabel="Sin evidencia"
        onStartEdit={vi.fn()}
      />,
    );

    expect(screen.getByText("Nombre del trabajador")).toBeInTheDocument();
    expect(screen.getByText("CURP")).toBeInTheDocument();
    expect(screen.getByText("Días hábiles:")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /editar/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /eliminar/i })).toBeInTheDocument();
  });
});
