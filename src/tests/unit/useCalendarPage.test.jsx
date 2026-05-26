import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { useCalendarPage } from "../../hooks/pages/useCalendarPage";
import {
    deleteAbsenceService,
    updateAbsenceService,
} from "../../services/calendarService";
import {
    deleteVacationRequest,
    getRemainingVacations,
    updateVacationRequestDates,
} from "../../services/vacationService";

vi.mock("../../services/calendarService", () => ({
    deleteAbsenceService: vi.fn(),
    updateAbsenceService: vi.fn(),
    buildAbsenceEvidenceUrl: vi.fn((link) => `http://api.test/${link}`),
}));

vi.mock("../../services/vacationService", () => ({
    deleteVacationRequest: vi.fn(),
    getRemainingVacations: vi.fn(),
    updateVacationRequestDates: vi.fn(),
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

const buildVacationClickInfo = () => ({
    event: {
        id: "vacation-1",
        title: "Vacaciones de Ana López",
        start: new Date("2026-06-05T00:00:00.000Z"),
        end: new Date("2026-06-11T00:00:00.000Z"),
        allDay: true,
        backgroundColor: "#22C55E",
        borderColor: "#16A34A",
        extendedProps: {
            focus: "vacaciones",
            vacationId: "vacation-1",
            employeeId: "emp-1",
            employeeName: "Ana López",
            curp: "LOAA900101MDFPPP09",
            startDate: "2026-06-05",
            endDate: "2026-06-10",
            readableStart: "2026-06-05",
            readableEnd: "2026-06-10",
            usedDays: 4,
            totalDays: 6,
            status: 1,
            feedback: "",
        },
    },
});

describe("useCalendarPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubGlobal("open", vi.fn());

        getRemainingVacations.mockResolvedValue({
            remainingVacations: 8,
            startDate: "2026-01-01",
            endDate: "2026-12-31",
        });
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

    it.each(["Administrador", "Coordinador"])(
        "muestra subir evidencia para %s cuando la ausencia no tiene evidencia",
        (viewerRole) => {
            const { result } = renderHook(() =>
                useCalendarPage({
                    viewerRole,
                }),
            );

            act(() => {
                result.current.handleEventClick(buildCalendarClickInfo());
            });

            expect(result.current.absenceEvidenceLabel).toBe("Subir evidencia");
        },
    );

    it("muestra sin evidencia para roles no administrativos cuando no hay evidencia", () => {
        const { result } = renderHook(() =>
            useCalendarPage({
                viewerRole: "Mantenimiento",
            }),
        );

        act(() => {
            result.current.handleEventClick(buildCalendarClickInfo());
        });

        expect(result.current.absenceEvidenceLabel).toBe("Sin evidencia");
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
                allDay: true,
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
            result.current.setAbsenceField(
                "description",
                "Descripción actualizada",
            );
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

    it("elimina la ausencia, recarga el rango y cierra el detalle", async () => {
        const reloadCurrentRange = vi.fn().mockResolvedValue([]);
        deleteAbsenceService.mockResolvedValue({
            absenceId: "absence-1",
            isDeleted: true,
        });

        const { result } = renderHook(() =>
            useCalendarPage({
                absenceTypeOptions: [{ value: "type-1", label: "Paternidad" }],
                reloadCurrentRange,
            }),
        );

        act(() => {
            result.current.handleEventClick(buildCalendarClickInfo());
        });

        act(() => {
            result.current.openDeleteAbsence();
        });

        expect(result.current.isDeleteAbsenceOpen).toBe(true);

        await act(async () => {
            await result.current.confirmDeleteAbsence();
        });

        expect(deleteAbsenceService).toHaveBeenCalledWith("absence-1");
        expect(reloadCurrentRange).toHaveBeenCalledTimes(1);
        expect(result.current.selectedEvent).toBe(null);
        expect(result.current.alert).toEqual({
            type: "success",
            message: "Ausencia eliminada correctamente",
        });
    });

    it("muestra error si falla la eliminación", async () => {
        deleteAbsenceService.mockRejectedValue(
            new Error("No se pudo eliminar"),
        );

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
            result.current.openDeleteAbsence();
        });

        await act(async () => {
            await result.current.confirmDeleteAbsence();
        });

        expect(result.current.absenceDeleteError).toBe("No se pudo eliminar");
        expect(result.current.isDeleteAbsenceOpen).toBe(true);
    });

    it("permite actualizar solo la evidencia y limpia el modo edición", async () => {
        const file = new File(["pdf"], "evidencia.pdf", {
            type: "application/pdf",
        });

        updateAbsenceService.mockResolvedValue({
            absenceId: "absence-1",
            link: "uploads/documents/evidencia.pdf",
        });

        const { result } = renderHook(() =>
            useCalendarPage({
                absenceTypeOptions: [{ value: "type-1", label: "Paternidad" }],
                reloadCurrentRange: vi.fn().mockResolvedValue([]),
            }),
        );

        act(() => {
            result.current.handleEventClick(buildCalendarClickInfo());
            result.current.startAbsenceEdit();
        });

        act(() => {
            result.current.handleAbsenceEvidenceChange({
                target: { files: [file] },
            });
        });

        await act(async () => {
            await result.current.submitAbsenceEdit();
        });

        expect(updateAbsenceService).toHaveBeenCalledWith("absence-1", {
            file,
        });
        expect(result.current.isAbsenceEditing).toBe(false);
    });

    it("abre la evidencia usando la URL completa del API", () => {
        const { result } = renderHook(() => useCalendarPage());

        act(() => {
            result.current.handleEventClick({
                event: {
                    ...buildCalendarClickInfo().event,
                    extendedProps: {
                        ...buildCalendarClickInfo().event.extendedProps,
                        link: "uploads/documents/evidencia.pdf",
                    },
                },
            });
        });

        act(() => {
            result.current.openAbsenceEvidence();
        });

        expect(window.open).toHaveBeenCalledWith(
            "http://api.test/uploads/documents/evidencia.pdf",
            "_blank",
            "noopener,noreferrer",
        );
    });

    it("inicializa el formulario de edición con los datos de la vacación seleccionada", () => {
        const { result } = renderHook(() =>
            useCalendarPage({
                reloadCurrentRange: vi.fn(),
            }),
        );

        act(() => {
            result.current.handleEventClick(buildVacationClickInfo());
        });

        act(() => {
            result.current.startVacationEdit();
        });

        expect(result.current.isVacationEditing).toBe(true);
        expect(result.current.vacationForm).toEqual({
            vacationRequestId: "vacation-1",
            startDate: "2026-06-05",
            endDate: "2026-06-10",
        });
    });

    it("actualiza la vacación, recarga el rango y muestra alerta de éxito", async () => {
        const reloadCurrentRange = vi.fn().mockResolvedValue([]);

        updateVacationRequestDates.mockResolvedValue({
            vacationRequestId: "vacation-1",
            startDate: "2026-06-06",
            endDate: "2026-06-12",
            status: 1,
        });

        const { result } = renderHook(() =>
            useCalendarPage({
                reloadCurrentRange,
            }),
        );

        act(() => {
            result.current.handleEventClick(buildVacationClickInfo());
            result.current.startVacationEdit();
            result.current.setVacationField("startDate", "2026-06-06");
            result.current.setVacationField("endDate", "2026-06-12");
        });

        await act(async () => {
            await result.current.submitVacationEdit();
        });

        expect(updateVacationRequestDates).toHaveBeenCalledWith({
            vacationRequestId: "vacation-1",
            startDate: "2026-06-06",
            endDate: "2026-06-12",
        });
        expect(reloadCurrentRange).toHaveBeenCalledTimes(1);
        expect(result.current.isVacationEditing).toBe(false);
        expect(result.current.alert).toEqual({
            type: "success",
            message: "Vacaciones modificadas correctamente",
        });
    });

    it("cierra el formulario de edición de vacaciones al cancelar", () => {
        const { result } = renderHook(() => useCalendarPage());

        act(() => {
            result.current.handleEventClick(buildVacationClickInfo());
            result.current.startVacationEdit();
        });

        expect(result.current.isVacationEditing).toBe(true);

        act(() => {
            result.current.cancelVacationEdit();
        });

        expect(result.current.isVacationEditing).toBe(false);
    });

    it("muestra error si falla la actualización de vacaciones", async () => {
        updateVacationRequestDates.mockRejectedValue(
            new Error("No se pudo actualizar vacaciones"),
        );

        const { result } = renderHook(() =>
            useCalendarPage({
                reloadCurrentRange: vi.fn(),
            }),
        );

        act(() => {
            result.current.handleEventClick(buildVacationClickInfo());
            result.current.startVacationEdit();
            result.current.setVacationField("startDate", "2026-06-06");
        });

        await act(async () => {
            await result.current.submitVacationEdit();
        });

        expect(result.current.vacationEditError).toBe(
            "No se pudo actualizar vacaciones",
        );
        expect(result.current.isVacationEditing).toBe(true);
    });

    it("elimina la vacación, recarga el rango y cierra el detalle", async () => {
        const reloadCurrentRange = vi.fn().mockResolvedValue([]);
        deleteVacationRequest.mockResolvedValue({
            vacationRequestId: "vacation-1",
        });

        const { result } = renderHook(() =>
            useCalendarPage({
                reloadCurrentRange,
            }),
        );

        act(() => {
            result.current.handleEventClick(buildVacationClickInfo());
        });

        act(() => {
            result.current.openDeleteVacation();
        });

        expect(result.current.isDeleteVacationOpen).toBe(true);

        await act(async () => {
            await result.current.confirmDeleteVacation();
        });

        expect(deleteVacationRequest).toHaveBeenCalledWith("vacation-1");
        expect(reloadCurrentRange).toHaveBeenCalledTimes(1);
        expect(result.current.selectedEvent).toBe(null);
        expect(result.current.alert).toEqual({
            type: "success",
            message: "Vacaciones eliminadas correctamente",
        });
    });

    it("muestra error si falla la eliminación de vacaciones", async () => {
        deleteVacationRequest.mockRejectedValue(
            new Error("No se pudo eliminar vacaciones"),
        );

        const { result } = renderHook(() =>
            useCalendarPage({
                reloadCurrentRange: vi.fn(),
            }),
        );

        act(() => {
            result.current.handleEventClick(buildVacationClickInfo());
            result.current.openDeleteVacation();
        });

        await act(async () => {
            await result.current.confirmDeleteVacation();
        });

        expect(result.current.deleteVacationError).toBe(
            "No se pudo eliminar vacaciones",
        );
        expect(result.current.isDeleteVacationOpen).toBe(true);
    });
});
