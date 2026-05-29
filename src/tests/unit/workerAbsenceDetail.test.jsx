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
  totalDays: 5,
  usedDays: 3,
};

describe("WorkerAbsenceDetail", () => {
  it("muestra los datos de una ausencia sin acciones administrativas", () => {
    render(
      <WorkerAbsenceDetail
        event={baseAbsence}
      />,
    );

    expect(screen.getByText("Ausencia")).toBeInTheDocument();
    expect(screen.getByText("Tipo de ausencia:")).toBeInTheDocument();
    expect(screen.getByText("Médica")).toBeInTheDocument();
    expect(screen.getByText("Fecha de inicio:")).toBeInTheDocument();
    expect(screen.getByText("Fecha de término:")).toBeInTheDocument();
    expect(screen.getByText("Días totales:")).toBeInTheDocument();
    expect(screen.getByText("Días hábiles:")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText(baseAbsence.description)).toBeInTheDocument();
    expect(screen.getByText("Sin evidencia")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /cerrar/i })).not.toBeInTheDocument();
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
      />,
    );

    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("marca los días como horario cdmx y muestra horas en horario foráneo", () => {
    render(
      <WorkerAbsenceDetail
        event={{
          ...baseAbsence,
          start: "2026-05-05T06:00:00.000Z",
          end: "2026-05-10T06:00:00.000Z",
        }}
        showMexicoReferenceNotice
        calendarTimeZone="America/Matamoros"
        onClose={vi.fn()}
      />,
    );

    expect(
      screen.getByText("Días totales (horario cdmx):"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Días hábiles (horario cdmx):"),
    ).toBeInTheDocument();
    expect(screen.getByText("Hora de inicio:")).toBeInTheDocument();
    expect(screen.getByText("Hora de término:")).toBeInTheDocument();
    expect(screen.getAllByText("1:00 a.m.")).toHaveLength(2);
  });

  it("limita la descripción a 200 caracteres y conserva el texto completo en hover", () => {
    const longDescription = `${"Detalle largo ".repeat(20)}
Segunda línea completa`;

    render(
      <WorkerAbsenceDetail
        event={{ ...baseAbsence, description: longDescription }}
      />,
    );

    const preview = `${longDescription.slice(0, 200).trimEnd()}...`;

    const description = screen.getByText(preview);

    expect(description).toBeInTheDocument();
    expect(description).toHaveAttribute("title", longDescription);
    expect(screen.queryByText(longDescription)).not.toBeInTheDocument();
  });
});
