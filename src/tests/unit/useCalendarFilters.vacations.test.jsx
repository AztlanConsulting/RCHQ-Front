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

const buildVacation = (overrides = {}) => ({
    focus: "vacaciones",
    vacationId: "vacation-1",
    employeeId: "employee-self",
    name: "Ana Pendiente",
    curp: "US170101HDF00003",
    type: "Vacaciones",
    start: "2026-06-05T00:00:00.000Z",
    end: "2026-06-11T00:00:00.000Z",
    startDate: "2026-06-05",
    endDate: "2026-06-10",
    lastsAllDay: true,
    status: 0,
    feedback: "",
    usedDays: 4,
    ...overrides,
});

const getVacationIds = (events) =>
    events
        .filter((event) => event.extendedProps.focus === "vacaciones")
        .map((event) => event.extendedProps.vacationId);

describe("useCalendarFilters - vacaciones", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        getEventsTypes.mockResolvedValue([{ name: "General" }]);
        getAbsenceTypes.mockResolvedValue([]);
        getHouseEmployees.mockResolvedValue([
            {
                employeeId: "employee-self",
                name: "Ana Pendiente",
                curp: "US170101HDF00003",
            },
            {
                employeeId: "employee-other",
                name: "Luis Aprobado",
                curp: "US170101HDF00004",
            },
        ]);
    });

    it("permite quitar vacaciones por estado aprobado o pendiente", async () => {
        const events = [
            buildVacation({
                vacationId: "pending-vacation",
                status: 0,
            }),
            buildVacation({
                vacationId: "approved-vacation",
                employeeId: "employee-other",
                name: "Luis Aprobado",
                status: 1,
            }),
        ];

        const { result } = renderHook(() =>
            useCalendarFilters(events, {
                isList: false,
                viewerRole: "Coordinador",
                calendarMode: "personal",
            }),
        );

        await waitFor(() => expect(getHouseEmployees).toHaveBeenCalledTimes(1));

        act(() => {
            result.current.setVacationStatusFilters(["aprobadas"]);
        });

        expect(getVacationIds(result.current.visibleEvents)).toEqual([
            "approved-vacation",
        ]);

        act(() => {
            result.current.setVacationStatusFilters(["en_espera"]);
        });

        expect(getVacationIds(result.current.visibleEvents)).toEqual([
            "pending-vacation",
        ]);
    });

    it("filtra vacaciones por dueño en calendario de casa", async () => {
        const events = [
            buildVacation({
                vacationId: "self-vacation",
                employeeId: "employee-self",
                name: "Ana Pendiente",
            }),
            buildVacation({
                vacationId: "other-vacation",
                employeeId: "employee-other",
                name: "Luis Aprobado",
            }),
        ];

        const { result } = renderHook(() =>
            useCalendarFilters(events, {
                isList: false,
                viewerRole: "Coordinador",
                calendarMode: "house",
            }),
        );

        await waitFor(() =>
            expect(result.current.employeeFilters).toEqual([
                "employee-self",
                "employee-other",
            ]),
        );

        act(() => {
            result.current.setEmployeeFilters(["employee-other"]);
        });

        expect(getVacationIds(result.current.visibleEvents)).toEqual([
            "other-vacation",
        ]);
    });

    it("oculta sus vacaciones al quitarse en calendario de casa y las vuelve a mostrar al regresar al personal", async () => {
        const selfVacation = buildVacation({
            vacationId: "self-vacation",
            employeeId: "employee-self",
            name: "Ana Pendiente",
        });
        const otherVacation = buildVacation({
            vacationId: "other-vacation",
            employeeId: "employee-other",
            name: "Luis Aprobado",
        });

        const { result, rerender } = renderHook(
            ({ calendarMode, events }) =>
                useCalendarFilters(events, {
                    isList: false,
                    viewerRole: "Coordinador",
                    calendarMode,
                }),
            {
                initialProps: {
                    calendarMode: "house",
                    events: [selfVacation, otherVacation],
                },
            },
        );

        await waitFor(() =>
            expect(result.current.employeeFilters).toEqual([
                "employee-self",
                "employee-other",
            ]),
        );

        act(() => {
            result.current.toggleEmployeeValue("employee-self", false);
        });

        expect(getVacationIds(result.current.visibleEvents)).toEqual([
            "other-vacation",
        ]);

        rerender({
            calendarMode: "personal",
            events: [selfVacation],
        });

        expect(getVacationIds(result.current.visibleEvents)).toEqual([
            "self-vacation",
        ]);
    });
});
