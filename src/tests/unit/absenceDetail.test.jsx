import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AbsenceDetail from "../../components/molecules/calendarCards/absenceDetail";

vi.mock("/document.svg", () => ({ default: "document.svg" }));

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
  it("mantiene la vista administrativa para coordinador", () => {
    render(
      <AbsenceDetail
        event={absence}
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
