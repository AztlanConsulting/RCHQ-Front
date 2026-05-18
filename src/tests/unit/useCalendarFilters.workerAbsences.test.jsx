import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useCalendarFilters } from "../../hooks/organism/useCalendarFilters";
import {
  getAbsenceTypes,
  getEventsTypes,
  getHouseEmployees,
} from "../../services/calendarService";

vi.mock("../../services/calendarService", () => ({
  getAbsenceTypes: vi.fn(),
  getEventsTypes: vi.fn(),
  getHouseEmployees: vi.fn(),
}));

const buildAbsence = (overrides = {}) => ({
  focus: "ausencias",
  absenceId: "absence-1",
  absenceTypeId: "type-medica",
  employeeId: "employee-worker",
  name: "Ausencia",
  type: "Médica",
  description: "Reposo indicado",
  start: "2026-05-05T00:00:00.000Z",
  end: "2026-05-10T00:00:00.000Z",
  startDate: "2026-05-05",
  endDate: "2026-05-09",
  lastsAllDay: true,
  link: "",
  isDeleted: false,
  usedDays: 3,
  ...overrides,
});

describe("useCalendarFilters - trabajador consulta ausencias", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getEventsTypes.mockResolvedValue([{ name: "General" }]);
    getAbsenceTypes.mockResolvedValue([
      { absenceTypeId: "type-medica", name: "Médica" },
    ]);
    getHouseEmployees.mockResolvedValue([
      { employeeId: "other-employee", name: "Otra persona" },
    ]);
  });

  it("no carga el catálogo de empleados de casa para un trabajador", async () => {
    const events = [
      buildAbsence({ link: "http://localhost:3000/uploads/absence.pdf" }),
      {
        focus: "eventos",
        name: "Evento global",
        scope: "global",
        type: "General",
        start: "2026-05-06T09:00:00.000Z",
        end: "2026-05-06T10:00:00.000Z",
        lastsAllDay: false,
        link: "http://localhost:3000/uploads/not-evidence.pdf",
      },
    ];

    console.log(events);

    const { result } = renderHook(() =>
      useCalendarFilters(events, {
        isList: false,
        viewerRole: "Mantenimiento",
      }),
    );

    await waitFor(() => expect(getAbsenceTypes).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(result.current.visibleEvents.map((event) => event.title))
        .toContain("Evento global"),
    );

    const absenceEvent = result.current.visibleEvents.find(
      (event) => event.extendedProps.absenceId === "absence-1",
    );
    const globalEvent = result.current.visibleEvents.find(
      (event) => event.title === "Evento global",
    );

    expect(getHouseEmployees).not.toHaveBeenCalled();
    expect(absenceEvent).toMatchObject({
      title: "Ausencia Médica",
      backgroundColor: "#EF4444",
      borderColor: "#DC2626",
      allDay: true,
    });
    expect(absenceEvent.extendedProps).toMatchObject({
      focus: "ausencias",
      eventType: "Médica",
      link: "http://localhost:3000/uploads/absence.pdf",
      usedDays: 3,
    });
    expect(globalEvent.extendedProps.link).toBe("");
  });

  it("no vuelve a cargar tipos de ausencia cuando cambia a rol administrativo", async () => {
    const { rerender } = renderHook(
      ({ viewerRole }) =>
        useCalendarFilters([], {
          isList: false,
          viewerRole,
        }),
      { initialProps: { viewerRole: "" } },
    );

    await waitFor(() => expect(getAbsenceTypes).toHaveBeenCalledTimes(1));
    expect(getHouseEmployees).not.toHaveBeenCalled();

    rerender({ viewerRole: "Administrador" });

    await waitFor(() => expect(getHouseEmployees).toHaveBeenCalledTimes(1));
    expect(getAbsenceTypes).toHaveBeenCalledTimes(1);
  });

  it("filtra ausencias del trabajador por evidencia", async () => {
    const events = [
      buildAbsence({
        absenceId: "with-evidence",
        link: "http://localhost:3000/uploads/absence.pdf",
      }),
      buildAbsence({
        absenceId: "without-evidence",
        startDate: "2026-05-12",
        endDate: "2026-05-12",
        link: "",
      }),
    ];

    const { result } = renderHook(() =>
      useCalendarFilters(events, {
        isList: false,
        viewerRole: "Psicóloga",
      }),
    );

    await waitFor(() => expect(getAbsenceTypes).toHaveBeenCalledTimes(1));

    act(() => {
      result.current.setAbsenceEvidenceFilters(["sin_evidencia"]);
    });

    expect(result.current.visibleEvents).toHaveLength(1);
    expect(result.current.visibleEvents[0].extendedProps.absenceId)
      .toBe("without-evidence");

    act(() => {
      result.current.setAbsenceEvidenceFilters(["con_evidencia"]);
    });

    expect(result.current.visibleEvents).toHaveLength(1);
    expect(result.current.visibleEvents[0].extendedProps.absenceId)
      .toBe("with-evidence");
  });

  it("mantiene seleccionados por defecto los nuevos tipos de ausencia mientras el usuario no cambie el filtro", async () => {
    getAbsenceTypes.mockResolvedValue([]);

    const initialEvents = [
      buildAbsence({
        absenceId: "medica",
        absenceTypeId: "type-medica",
        type: "Médica",
      }),
    ];

    const nextEvents = [
      ...initialEvents,
      buildAbsence({
        absenceId: "personal",
        absenceTypeId: "type-personal",
        type: "Personal",
        startDate: "2026-05-12",
        endDate: "2026-05-12",
      }),
    ];

    const { result, rerender } = renderHook(
      ({ events }) =>
        useCalendarFilters(events, {
          isList: false,
          viewerRole: "Psicóloga",
        }),
      { initialProps: { events: initialEvents } },
    );

    await waitFor(() => expect(getAbsenceTypes).toHaveBeenCalledTimes(1));
    expect(result.current.absenceTypeFilters).toEqual(["médica"]);

    rerender({ events: nextEvents });

    await waitFor(() => {
      expect(result.current.absenceTypeFilters).toEqual(["médica", "personal"]);
    });
    await waitFor(() => {
      expect(
        result.current.visibleEvents.map((event) => event.extendedProps.absenceId),
      ).toEqual(expect.arrayContaining(["medica", "personal"]));
    });
  });
});
