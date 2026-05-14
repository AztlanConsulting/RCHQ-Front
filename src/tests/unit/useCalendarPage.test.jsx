import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { useCalendarPage } from "../../hooks/pages/useCalendarPage";
import { updateAbsenceService } from "../../services/calendarService";

vi.mock("../../services/calendarService", () => ({
  updateAbsenceService: vi.fn(),
}));

const buildCalendarClickInfo = () => ({
  event: {
    id: "fc-1",
    title: "Ausencia de Luis Martínez",
    start: new Date("2026-05-17T00:00:00.000Z"),
    end: new Date("2026-05-22T00:00:00.000Z"),
    allDay: true,
    backgroundColor: "#EF4444",
    borderColor: "#DC2626",
    extendedProps: {
      absenceId: "absence-1",
      absenceTypeId: "type-1",
      employeeId: "emp-1",
      employeeName: "Luis Martínez",
      description: "Permiso por paternidad",
      focus: "ausencias",
      eventType: "Paternidad",
      curp: "MALR900205HDFRRS09",
      usedDays: 5,
      link: "",
      startDate: "2026-05-17",
      endDate: "2026-05-21",
      isDeleted: false,
    },
  },
});

describe("useCalendarPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("inicializa el formulario de edición con los datos de la ausencia seleccionada", () => {
    const { result } = renderHook(() =>
      useCalendarPage({
        absenceTypeOptions: [{ value: "type-1", label: "Paternidad" }],
        reloadCurrentRange: vi.fn(),
      }),
    );

    act(() => {
      result.current.handleEventClick(buildCalendarClickInfo());
    });

    act(() => {
      result.current.startAbsenceEdit();
    });

    expect(result.current.isAbsenceEditing).toBe(true);
    expect(result.current.absenceForm).toEqual({
      absenceTypeId: "type-1",
      startDate: "2026-05-17",
      endDate: "2026-05-21",
      description: "Permiso por paternidad",
    });
  });

  it("sanitiza caracteres especiales, conserva signos permitidos y limita a 200 caracteres", () => {
    const { result } = renderHook(() => useCalendarPage());
    const longText = `Texto base!!! 😀 📌 con emoji ¿vale? #123 ${"a".repeat(220)}`;

    act(() => {
      result.current.setAbsenceField("description", longText);
    });

    expect(result.current.absenceForm.description).toMatch(
      /^Texto base!!! con emoji ¿vale\? 123/,
    );
    expect(result.current.absenceForm.description.length).toBe(200);
  });

  it("no manda petición si no hubo cambios al modificar la ausencia", async () => {
    const { result } = renderHook(() =>
      useCalendarPage({
        absenceTypeOptions: [{ value: "type-1", label: "Paternidad" }],
        reloadCurrentRange: vi.fn(),
      }),
    );

    act(() => {
      result.current.handleEventClick(buildCalendarClickInfo());
      result.current.startAbsenceEdit();
    });

    await act(async () => {
      await result.current.submitAbsenceEdit();
    });

    expect(updateAbsenceService).not.toHaveBeenCalled();
    expect(result.current.isAbsenceEditing).toBe(false);
  });

  it("actualiza la ausencia, recarga el rango y muestra alerta de éxito", async () => {
    const reloadCurrentRange = vi.fn().mockResolvedValue([
      {
        absenceId: "absence-1",
        absenceTypeId: "type-2",
        employeeId: "emp-1",
        name: "Luis Martínez",
        curp: "MALR900205HDFRRS09",
        start: "2026-05-18T00:00:00.000Z",
        end: "2026-05-23T00:00:00.000Z",
        startDate: "2026-05-18",
        endDate: "2026-05-22",
        type: "Médica",
        description: "Descripción actualizada",
        link: "",
        isDeleted: false,
        usedDays: 4,
        focus: "ausencias",
        scope: "house",
        lastsAllDay: true,
      },
    ]);

    updateAbsenceService.mockResolvedValue({
      absenceId: "absence-1",
      absenceTypeId: "type-2",
      name: "Luis Martínez",
      type: "Médica",
      description: "Descripción actualizada",
      startDate: "2026-05-18",
      endDate: "2026-05-22",
      isDeleted: false,
    });

    const { result } = renderHook(() =>
      useCalendarPage({
        absenceTypeOptions: [
          { value: "type-1", label: "Paternidad" },
          { value: "type-2", label: "Médica" },
        ],
        reloadCurrentRange,
      }),
    );

    act(() => {
      result.current.handleEventClick(buildCalendarClickInfo());
      result.current.startAbsenceEdit();
      result.current.setAbsenceField("absenceTypeId", "type-2");
      result.current.setAbsenceField("startDate", "2026-05-18");
      result.current.setAbsenceField("endDate", "2026-05-22");
      result.current.setAbsenceField("description", "Descripción actualizada");
    });

    await act(async () => {
      await result.current.submitAbsenceEdit();
    });

    expect(updateAbsenceService).toHaveBeenCalledWith("absence-1", {
      absenceTypeId: "type-2",
      startDate: "2026-05-18",
      endDate: "2026-05-22",
      description: "Descripción actualizada",
    });
    expect(reloadCurrentRange).toHaveBeenCalledTimes(1);
    expect(result.current.selectedEvent.eventType).toBe("Médica");
    expect(result.current.alert).toEqual({
      type: "success",
      message: "Ausencia actualizada correctamente",
    });
  });
});
