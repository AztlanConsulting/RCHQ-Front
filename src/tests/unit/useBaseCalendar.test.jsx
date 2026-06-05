import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useBaseCalendar } from "../../hooks/organism/useBaseCalendar";
import {
    getCalendarViewerRole,
    getEventsInRange,
    getHouseEventsInRange,
} from "../../services/calendarService";

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
        view: { type: "dayGridMonth" },
        changeView: vi.fn((view) => {
            calendarApi.view.type = view;
        }),
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

const buildDateInfo = () => ({
    startStr: "2026-05-06T00:00:00-05:00",
    endStr: "2026-05-07T00:00:00-05:00",
    view: {
        calendar: {
            getDate: () => new Date(2026, 4, 6),
        },
    },
});

describe("useBaseCalendar", () => {
    beforeEach(() => {
        document.body.innerHTML = "";
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

    it("muestra el nombre correcto del día sin mutar la fecha del header", () => {
        const { result } = renderHook(() => useBaseCalendar());
        const headerDate = new Date("2026-06-01T00:00:00.000Z");

        const label = result.current.getWeekDayName({ date: headerDate });

        expect(label).toBe("Lun");
        expect(headerDate.toISOString()).toBe("2026-06-01T00:00:00.000Z");
    });

    it("muestra día y número correctos en el header de semana", () => {
        const { result } = renderHook(() => useBaseCalendar());
        const { calendarRef } = makeCalendarRef();

        act(() => {
            result.current.setWeekView(calendarRef);
        });

        const label = result.current.getWeekDayName({
            date: new Date("2026-06-03T00:00:00.000Z"),
        });

        expect(label).toBe("Mié 3");
    });

    it("usa nombres completos en el header cuando hay espacio suficiente", () => {
        const tableCell = document.createElement("div");
        tableCell.className = "fc-day";
        Object.defineProperty(tableCell, "clientWidth", { value: 180 });
        document.body.appendChild(tableCell);

        const { result } = renderHook(() => useBaseCalendar());
        const { calendarRef } = makeCalendarRef();

        act(() => {
            result.current.setWeekView(calendarRef);
        });

        expect(
            result.current.getWeekDayName({
                date: new Date("2026-06-03T00:00:00.000Z"),
            }),
        ).toBe("Miércoles 3");
    });

    it("calcula el header con el día UTC del marcador del calendario", () => {
        const { result } = renderHook(() => useBaseCalendar());
        const headerDate = new Date("2026-06-01T23:00:00.000Z");

        expect(result.current.getWeekDayName({ date: headerDate })).toBe("Lun");
    });

    it("consulta un dia extra antes y despues del rango visible para eventos con desfase horario", async () => {
        const { result } = renderHook(() => useBaseCalendar());

        await act(async () => {
            await result.current.handleDatesSet(buildDateInfo());
        });

        expect(getEventsInRange).toHaveBeenCalledWith(
            "employee-1",
            "2026-05-05",
            "2026-05-08",
        );
    });

    it("en calendario personal solo mantiene capacitaciones personales donde el trabajador esta registrado", async () => {
        vi.mocked(getCalendarViewerRole).mockReturnValue("Empleado");
        vi.mocked(getHouseEventsInRange).mockResolvedValue([]);
        vi.mocked(getEventsInRange).mockResolvedValue([
            {
                eventId: "training-assigned",
                focus: "eventos",
                scope: "personal",
                eventType: "Capacitaciones",
                peopleInsideEvent: [
                    { id: "employee-1", name: "Laura" },
                    { id: "employee-8", name: "Mario" },
                ],
            },
            {
                eventId: "training-unassigned",
                focus: "eventos",
                scope: "personal",
                eventType: "Capacitaciones",
                peopleInsideEvent: [{ id: "employee-9", name: "Rosa" }],
            },
        ]);

        const { result } = renderHook(() => useBaseCalendar());

        await act(async () => {
            await result.current.handleDatesSet(buildDateInfo());
        });

        expect(result.current.calendarMode).toBe("personal");
        expect(result.current.canSwitchCalendarMode).toBe(false);
        expect(result.current.allEvents).toHaveLength(1);
        expect(result.current.allEvents[0]).toMatchObject({
            eventId: "training-assigned",
            eventType: "Capacitaciones",
        });
    });

    it("el coordinador puede cambiar al calendario de casa y ver capacitaciones no ligadas a su registro", async () => {
        vi.mocked(getCalendarViewerRole).mockReturnValue("Coordinador");
        vi.mocked(getHouseEventsInRange).mockResolvedValue([]);
        vi.mocked(getEventsInRange).mockResolvedValue([
            {
                eventId: "training-assigned",
                focus: "eventos",
                scope: "personal",
                eventType: "Capacitaciones",
                peopleInsideEvent: [{ id: "employee-1", name: "Laura" }],
            },
            {
                eventId: "training-house",
                focus: "eventos",
                scope: "personal",
                eventType: "Capacitaciones",
                peopleInsideEvent: [{ id: "employee-9", name: "Rosa" }],
            },
        ]);

        const { result } = renderHook(() => useBaseCalendar());

        await act(async () => {
            await result.current.handleDatesSet(buildDateInfo());
        });

        expect(result.current.canSwitchCalendarMode).toBe(true);
        expect(result.current.allEvents.map((event) => event.eventId)).toEqual([
            "training-assigned",
        ]);

        act(() => {
            result.current.setCalendarMode("house");
        });

        expect(result.current.allEvents.map((event) => event.eventId)).toEqual([
            "training-assigned",
            "training-house",
        ]);
    });
});
