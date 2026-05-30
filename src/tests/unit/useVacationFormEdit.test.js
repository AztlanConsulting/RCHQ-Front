import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useRef } from "react";
import { useVacationFormEdit } from "../../hooks/pages/useVacationFormEdit";
import {
    getRemainingVacations,
    updateVacationRequestDates,
} from "../../services/vacationService";
import { getEmployeeDateRules } from "../../services/calendarService";

vi.mock("../../services/vacationService", () => ({
    getRemainingVacations: vi.fn(),
    updateVacationRequestDates: vi.fn(),
}));

vi.mock("../../services/calendarService", () => ({
    getEmployeeDateRules: vi.fn(),
}));

const baseVacation = {
    focus: "vacaciones",
    vacationId: "vacation-1",
    employeeId: "emp-1",
    startDate: "2026-06-05",
    endDate: "2026-06-10",
    status: 1,
    usedDays: 4,
};

const renderUseVacationFormEdit = ({
    selectedEvent = baseVacation,
    reloadCurrentRange = vi.fn(),
    setSelectedEvent = vi.fn(),
    setAlert = vi.fn(),
} = {}) => {
    const wrapperHook = () => {
        const selectedEventRef = useRef(selectedEvent);

        return useVacationFormEdit({
            selectedEvent,
            selectedEventRef,
            reloadCurrentRange,
            setSelectedEvent,
            setAlert,
        });
    };

    return renderHook(wrapperHook);
};

describe("useVacationFormEdit", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        getRemainingVacations.mockResolvedValue({
            remainingVacations: 8,
            startDate: "2026-01-01",
            endDate: "2026-12-31",
        });
        getEmployeeDateRules.mockResolvedValue({
            remainingVacations: 8,
            vacationPeriod: {
                startDate: "2026-01-01",
                endDate: "2026-12-31",
            },
        });
    });

    it("inicializa el formulario con vacationRequestId, startDate y endDate existentes", async () => {
        const { result } = renderUseVacationFormEdit();

        act(() => {
            result.current.startVacationEdit();
        });

        expect(result.current.isVacationEditing).toBe(true);
        expect(result.current.vacationForm).toEqual({
            vacationRequestId: "vacation-1",
            startDate: "2026-06-05",
            endDate: "2026-06-10",
        });

        await waitFor(() => {
            expect(getEmployeeDateRules).toHaveBeenCalledWith("emp-1", "vacation");
        });
    });

    it("carga los días disponibles del empleado al iniciar edición", async () => {
        const { result } = renderUseVacationFormEdit();

        act(() => {
            result.current.startVacationEdit();
        });

        await waitFor(() => {
            expect(result.current.vacationRemainingInfo).toEqual({
                remainingVacations: 8,
                startDate: "2026-01-01",
                endDate: "2026-12-31",
            });
        });
    });

    it("permite cambiar startDate", async () => {
        const { result } = renderUseVacationFormEdit();
        await act(async () => {
            result.current.startVacationEdit();
        });
        act(() => {
            result.current.setVacationField("startDate", "2026-06-06");
        });
        expect(result.current.vacationForm.startDate).toBe("2026-06-06");
    });

    it("permite cambiar endDate", async () => {
        const { result } = renderUseVacationFormEdit();
        await act(async () => {
            result.current.startVacationEdit();
        });
        act(() => {
            result.current.setVacationField("endDate", "2026-06-12");
        });
        expect(result.current.vacationForm.endDate).toBe("2026-06-12");
    });

    it("valida que startDate sea obligatorio", async () => {
        const { result } = renderUseVacationFormEdit();

        act(() => {
            result.current.startVacationEdit();
            result.current.setVacationField("startDate", "");
        });

        await act(async () => {
            await result.current.submitVacationEdit();
        });

        expect(result.current.vacationEditError).toMatch(/fecha de inicio/i);
        expect(updateVacationRequestDates).not.toHaveBeenCalled();
    });

    it("valida que endDate sea obligatorio", async () => {
        const { result } = renderUseVacationFormEdit();

        act(() => {
            result.current.startVacationEdit();
            result.current.setVacationField("endDate", "");
        });

        await act(async () => {
            await result.current.submitVacationEdit();
        });

        expect(result.current.vacationEditError).toMatch(/fecha de fin|fecha final/i);
        expect(updateVacationRequestDates).not.toHaveBeenCalled();
    });

    it("valida que endDate no sea anterior a startDate", async () => {
        const { result } = renderUseVacationFormEdit({
            selectedEvent: {
                ...baseVacation,
                startDate: "2026-06-10",
                endDate: "2026-06-05",
            },
        });

        act(() => {
            result.current.startVacationEdit();
        });

        await act(async () => {
            await result.current.submitVacationEdit();
        });

        expect(result.current.vacationEditError).toBe(
            "La fecha de inicio no puede ser posterior a la fecha de fin",
        );
        expect(updateVacationRequestDates).not.toHaveBeenCalled();
    });

    it("no manda petición si no hubo cambios", async () => {
        const { result } = renderUseVacationFormEdit();

        act(() => {
            result.current.startVacationEdit();
        });

        await act(async () => {
            await result.current.submitVacationEdit();
        });

        expect(updateVacationRequestDates).not.toHaveBeenCalled();
        expect(result.current.isVacationEditing).toBe(false);
    });

    it("llama a updateVacationRequestDates con el vacationRequestId correcto", async () => {
        updateVacationRequestDates.mockResolvedValue({
            vacationRequestId: "vacation-1",
            startDate: "2026-06-06",
            endDate: "2026-06-12",
        });

        const reloadCurrentRange = vi.fn().mockResolvedValue([]);
        const setSelectedEvent = vi.fn();
        const setAlert = vi.fn();

        const { result } = renderUseVacationFormEdit({
            reloadCurrentRange,
            setSelectedEvent,
            setAlert,
        });

        act(() => {
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
        expect(setSelectedEvent).toHaveBeenCalledWith(
            expect.objectContaining({
                vacationId: "vacation-1",
                vacationRequestId: "vacation-1",
                startDate: "2026-06-06",
                endDate: "2026-06-12",
            }),
        );
        expect(setAlert).toHaveBeenCalledWith({
            type: "success",
            message: "Vacaciones editadas correctamente",
        });
    });

    it("usa el evento recargado si reloadCurrentRange devuelve la vacación actualizada", async () => {
        updateVacationRequestDates.mockResolvedValue({
            vacationRequestId: "vacation-1",
            startDate: "2026-06-06",
            endDate: "2026-06-12",
        });

        const refreshedVacation = {
            focus: "vacaciones",
            vacationId: "vacation-1",
            employeeId: "emp-1",
            name: "Ana López",
            curp: "LOAA900101MDFPPP09",
            start: "2026-06-06T00:00:00.000Z",
            end: "2026-06-13T00:00:00.000Z",
            startDate: "2026-06-06",
            endDate: "2026-06-12",
            status: 1,
            usedDays: 5,
        };

        const setSelectedEvent = vi.fn();

        const { result } = renderUseVacationFormEdit({
            reloadCurrentRange: vi.fn().mockResolvedValue([refreshedVacation]),
            setSelectedEvent,
        });

        act(() => {
            result.current.startVacationEdit();
            result.current.setVacationField("startDate", "2026-06-06");
            result.current.setVacationField("endDate", "2026-06-12");
        });

        await act(async () => {
            await result.current.submitVacationEdit();
        });

        expect(setSelectedEvent).toHaveBeenCalledWith(
            expect.objectContaining({
                focus: "vacaciones",
                vacationId: "vacation-1",
                employeeId: "emp-1",
                startDate: "2026-06-06",
                endDate: "2026-06-12",
                usedDays: 5,
            }),
        );
    });

    it("muestra alerta y no permite editar vacaciones rechazadas", () => {
        const setAlert = vi.fn();

        const { result } = renderUseVacationFormEdit({
            selectedEvent: {
                ...baseVacation,
                status: 2,
            },
            setAlert,
        });

        act(() => {
            result.current.startVacationEdit();
        });

        expect(result.current.isVacationEditing).toBe(false);
        expect(setAlert).toHaveBeenCalledWith({
            type: "error",
            message: "No se pueden editar vacaciones rechazadas",
        });
    });

    it("guarda error cuando el servicio falla", async () => {
        updateVacationRequestDates.mockRejectedValue(
            new Error("No se pudo actualizar"),
        );

        const { result } = renderUseVacationFormEdit();

        act(() => {
            result.current.startVacationEdit();
            result.current.setVacationField("startDate", "2026-06-06");
        });

        await act(async () => {
            await result.current.submitVacationEdit();
        });

        expect(result.current.vacationEditError).toBe("No se pudo actualizar");
        expect(result.current.isVacationEditing).toBe(true);
    });
});