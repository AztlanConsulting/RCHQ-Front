import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useUpdateHouseEventForm } from "../../hooks/pages/useUpdateHouseEventForm";
import { useUpdatePersonalEventForm } from "../../hooks/pages/useUpdatePersonalEventForm";
import { getCalendarViewerRole } from "../../services/calendarService";
import {
    getEmployeesForSelector,
    getEventTypes,
} from "../../services/eventService";
import {
    updateHouseEvent,
    updatePersonalEvent,
} from "../../services/updateEventService";

vi.mock("../../services/updateEventService", () => ({
    updateHouseEvent: vi.fn(),
    updatePersonalEvent: vi.fn(),
}));

vi.mock("../../services/eventService", () => ({
    getEventTypes: vi.fn(),
    getEmployeesForSelector: vi.fn(),
}));

vi.mock("../../services/calendarService", () => ({
    getCalendarViewerRole: vi.fn(),
}));

const eventTypeId = "11111111-1111-4111-8111-111111111111";

const mexicoHouseAllDayEvent = {
    houseEventId: "house-event-1",
    title: "Retiro",
    eventTypeId,
    description: "",
    allDay: true,
    isFreeDay: false,
    start: "2026-05-05T06:00:00.000Z",
    end: "2026-05-06T06:00:00.000Z",
    startDate: "2026-05-05",
    endDate: "2026-05-05",
};

const mexicoHouseMultiDayAllDayEvent = {
    ...mexicoHouseAllDayEvent,
    end: "2026-05-08T06:00:00.000Z",
    endDate: "2026-05-07",
};

const shiftedHouseAllDayEvent = {
    ...mexicoHouseAllDayEvent,
    allDay: false,
    startDate: "2026-05-05",
    endDate: "2026-05-06",
};

const shiftedPersonalAllDayEvent = {
    eventId: "personal-event-1",
    title: "Capacitación",
    eventTypeId,
    eventType: "General",
    description: "",
    trainer: "",
    allDay: false,
    date: "2026-05-05",
    start: "2026-05-05T06:00:00.000Z",
    end: "2026-05-06T06:00:00.000Z",
    peopleInsideEvent: [],
};

describe("hooks de edición de eventos con timezone", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        getEventTypes.mockResolvedValue([
            { eventTypeId, name: "General" },
        ]);
        getEmployeesForSelector.mockResolvedValue([]);
        getCalendarViewerRole.mockReturnValue("Coordinador");
        updateHouseEvent.mockResolvedValue({ success: true, data: {} });
        updatePersonalEvent.mockResolvedValue({ success: true, data: {} });
    });

    it("inicializa un evento de casa all-day en México sin restar la fecha final inclusiva", async () => {
        const { result } = renderHook(() =>
            useUpdateHouseEventForm({
                event: mexicoHouseAllDayEvent,
                isOpen: true,
                calendarTimeZone: "America/Mexico_City",
            }),
        );

        await waitFor(() => expect(getEventTypes).toHaveBeenCalledWith("house"));

        expect(result.current.form).toMatchObject({
            allDay: true,
            startDate: "2026-05-05",
            endDate: "2026-05-05",
            startTime: "",
            endTime: "",
        });
    });

    it("conserva la fecha final inclusiva en eventos de casa all-day de varios días", async () => {
        const { result } = renderHook(() =>
            useUpdateHouseEventForm({
                event: mexicoHouseMultiDayAllDayEvent,
                isOpen: true,
                calendarTimeZone: "America/Mexico_City",
            }),
        );

        await waitFor(() => expect(getEventTypes).toHaveBeenCalledWith("house"));

        expect(result.current.form).toMatchObject({
            allDay: true,
            startDate: "2026-05-05",
            endDate: "2026-05-07",
            startTime: "",
            endTime: "",
        });
    });

    it("conserva la fecha final inclusiva de eventos de casa all-day aunque se edite en horario foráneo", async () => {
        const { result } = renderHook(() =>
            useUpdateHouseEventForm({
                event: mexicoHouseMultiDayAllDayEvent,
                isOpen: true,
                calendarTimeZone: "Europe/London",
            }),
        );

        await waitFor(() => expect(getEventTypes).toHaveBeenCalledWith("house"));

        expect(result.current.form).toMatchObject({
            allDay: true,
            startDate: "2026-05-05",
            endDate: "2026-05-07",
            startTime: "",
            endTime: "",
        });
    });

    it("inicializa un evento de casa all-day desplazado como evento con horas en horario foráneo", async () => {
        const { result } = renderHook(() =>
            useUpdateHouseEventForm({
                event: shiftedHouseAllDayEvent,
                isOpen: true,
                calendarTimeZone: "America/Matamoros",
            }),
        );

        await waitFor(() => expect(getEventTypes).toHaveBeenCalledWith("house"));

        expect(result.current.form).toMatchObject({
            allDay: false,
            startDate: "2026-05-05",
            endDate: "2026-05-06",
            startTime: "01:00",
            endTime: "01:00",
        });
    });

    it("inicializa un evento personal all-day desplazado como evento con horas en horario foráneo", async () => {
        const { result } = renderHook(() =>
            useUpdatePersonalEventForm({
                event: shiftedPersonalAllDayEvent,
                isOpen: true,
                calendarTimeZone: "America/Matamoros",
                calendarTimeZoneMode: "local",
                canSwitchCalendarTimeZone: true,
            }),
        );

        await waitFor(() =>
            expect(getEventTypes).toHaveBeenCalledWith("personal"),
        );

        expect(result.current.form).toMatchObject({
            allDay: false,
            date: "2026-05-05",
            endDate: "2026-05-06",
            startTime: "01:00",
            endTime: "01:00",
        });
    });
});
