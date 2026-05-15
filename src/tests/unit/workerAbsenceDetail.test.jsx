import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import WorkerAbsenceDetail from "../../components/molecules/calendarCards/workerAbsenceDetail";

const baseAbsence = {
  eventType: "Médica",
  startDate: "2026-05-05",
  endDate: "2026-05-09",
  description:
    "El empleado fue hospitalizado por resfriado común, menciona sentirse cansado e incapaz de trabajar",
  link: "",
  usedDays: 3,
};

describe("WorkerAbsenceDetail", () => {
  it("muestra los datos de una ausencia sin acciones administrativas", () => {
    render(
      <WorkerAbsenceDetail
        event={baseAbsence}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText("Ausencia")).toBeInTheDocument();
    expect(screen.getByText("Tipo de ausencia:")).toBeInTheDocument();
    expect(screen.getByText("Médica")).toBeInTheDocument();
    expect(screen.getByText("Fecha de inicio:")).toBeInTheDocument();
    expect(screen.getByText("Fecha de fin:")).toBeInTheDocument();
    expect(screen.getByText("Días hábiles:")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText(baseAbsence.description)).toBeInTheDocument();
    expect(screen.getByText("Sin evidencia")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cerrar/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /editar/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /eliminar/i })).not.toBeInTheDocument();
  });

  it("abre la evidencia cuando la ausencia tiene URL", () => {
    const onOpenEvidence = vi.fn();

    render(
      <WorkerAbsenceDetail
        event={{ ...baseAbsence, link: "http://localhost:3000/uploads/absence.pdf" }}
        evidenceLabel="Ver evidencia"
        onOpenEvidence={onOpenEvidence}
        onClose={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /ver evidencia/i }));

    expect(onOpenEvidence).toHaveBeenCalledTimes(1);
    expect(screen.queryByText("Sin evidencia")).not.toBeInTheDocument();
  });

  it("muestra cero días hábiles cuando la ausencia no usa días", () => {
    render(
      <WorkerAbsenceDetail
        event={{ ...baseAbsence, usedDays: 0 }}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText("0")).toBeInTheDocument();
  });
});
