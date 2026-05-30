import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useBaseCalendar } from "../../hooks/organism/useBaseCalendar";
import { getEventsInRange } from "../../services/calendarService";

vi.mock("../../services/calendarService", () => ({
    getCalendarViewerRole: vi.fn(() => "Empleado"),
    getEmployeeHouseName: vi.fn(() => Promise.resolve("Casa Norte")),
    getEventsInRange: vi.fn(() => Promise.resolve([])),
    getHouseEventsInRange: vi.fn(() => Promise.resolve([])),
    getOwnEmployeeId: vi.fn(() => "employee-1"),
}));

const makeCalendarRef = () => {
    const calendarApi = {
        selectable: true,
        unselect: vi.fn(),
    };

    return {
        calendarApi,
        calendarRef: {
            current: {
                getApi: () => calendarApi,
            },
        },
    };
};

describe("useBaseCalendar", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("transfiere fecha y hora cuando se selecciona un rango con horario", () => {
        const { result } = renderHook(() => useBaseCalendar());
        const { calendarApi, calendarRef } = makeCalendarRef();

        act(() => {
            result.current.handleDateDrags(
                {
                    allDay: false,
                    start: new Date(2026, 4, 5, 9, 30),
                    end: new Date(2026, 4, 5, 11, 0),
                },
                calendarRef,
            );
        });

        expect(result.current.selectedDates).toEqual({
            startDate: "2026-05-05",
            endDate: "2026-05-05",
            startTime: "09:30",
            endTime: "11:00",
            allDay: false,
        });
        expect(calendarApi.selectable).toBe(false);
    });

    it("mantiene el fin inclusivo y sin horas para selecciones all-day", () => {
        const { result } = renderHook(() => useBaseCalendar());
        const { calendarRef } = makeCalendarRef();

        act(() => {
            result.current.handleDateDrags(
                {
                    allDay: true,
                    start: new Date(2026, 4, 5),
                    end: new Date(2026, 4, 8),
                },
                calendarRef,
            );
        });

        expect(result.current.selectedDates).toEqual({
            startDate: "2026-05-05",
            endDate: "2026-05-07",
            startTime: "",
            endTime: "",
            allDay: true,
        });
    });

    it("consulta un día extra antes y después del rango visible para eventos con desfase horario", async () => {
        const { result } = renderHook(() => useBaseCalendar());

        await act(async () => {
            await result.current.handleDatesSet({
                startStr: "2026-05-06T00:00:00-05:00",
                endStr: "2026-05-07T00:00:00-05:00",
                view: {
                    calendar: {
                        getDate: () => new Date(2026, 4, 6),
                    },
                },
            });
        });

        expect(getEventsInRange).toHaveBeenCalledWith(
            "employee-1",
            "2026-05-05",
            "2026-05-08",
        );
    });
});
