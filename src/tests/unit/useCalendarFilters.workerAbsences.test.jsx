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
    name: "John Smith",
    type: "Médica",
    description: "Reposo indicado",
    start: "2026-05-05T06:00:00.000Z",
    end: "2026-05-10T06:00:00.000Z",
    startDate: "2026-05-05",
    endDate: "2026-05-09",
    allDay: true,
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

    it("usa el color de eliminadas cuando se activa el filtro de ausencias eliminadas", async () => {
        const events = [
            buildAbsence({
                absenceId: "deleted-absence",
                isDeleted: true,
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
            result.current.setAbsenceStatusFilters(["eliminadas"]);
        });

        await waitFor(() => {
            expect(result.current.visibleEvents).toHaveLength(1);
        });

        expect(result.current.visibleEvents[0]).toMatchObject({
            backgroundColor: "#3E000C",
            borderColor: "#3E000C",
        });
        expect(result.current.visibleEvents[0].extendedProps).toMatchObject({
            absenceId: "deleted-absence",
            isDeleted: true,
        });
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
                allDay: false,
                link: "http://localhost:3000/uploads/not-evidence.pdf",
            },
        ];

        const { result } = renderHook(() =>
            useCalendarFilters(events, {
                isList: false,
                viewerRole: "Mantenimiento",
                calendarTimeZone: "America/Mexico_City",
            }),
        );

        await waitFor(() => expect(getAbsenceTypes).toHaveBeenCalledTimes(1));
        await waitFor(() =>
            expect(
                result.current.visibleEvents.map((event) => event.title),
            ).toContain("Evento global"),
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
            backgroundColor: "#A8201A",
            borderColor: "#A8201A",
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

    it("no vuelve a cargar tipos de ausencia cuando cambia a Coordinador", async () => {
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

        rerender({ viewerRole: "Coordinador" });

        await waitFor(() => expect(getHouseEmployees).toHaveBeenCalledTimes(1));
        expect(getAbsenceTypes).toHaveBeenCalledTimes(1);
    });

    it("no carga empleados de casa para Administrador porque el backend restringe esa ruta a Coordinador", async () => {
        renderHook(() =>
            useCalendarFilters([], {
                isList: false,
                viewerRole: "Administrador",
            }),
        );

        await waitFor(() => expect(getAbsenceTypes).toHaveBeenCalledTimes(1));
        expect(getHouseEmployees).not.toHaveBeenCalled();
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
        expect(result.current.visibleEvents[0].extendedProps.absenceId).toBe(
            "without-evidence",
        );

        act(() => {
            result.current.setAbsenceEvidenceFilters(["con_evidencia"]);
        });

        expect(result.current.visibleEvents).toHaveLength(1);
        expect(result.current.visibleEvents[0].extendedProps.absenceId).toBe(
            "with-evidence",
        );
    });

    it("adapta ausencias all-day entre horario central de México y horario foráneo", async () => {
        const absence = buildAbsence({
            absenceId: "timezone-absence",
            start: "2026-05-05T06:00:00.000Z",
            end: "2026-05-06T06:00:00.000Z",
            startDate: "2026-05-05",
            endDate: "2026-05-05",
            totalDays: 1,
            usedDays: 1,
        });

        const { result, rerender } = renderHook(
            ({ calendarTimeZone }) =>
                useCalendarFilters([absence], {
                    isList: false,
                    viewerRole: "Psicóloga",
                    calendarTimeZone,
                }),
            {
                initialProps: {
                    calendarTimeZone: "America/Mexico_City",
                },
            },
        );

        await waitFor(() => expect(getAbsenceTypes).toHaveBeenCalledTimes(1));

        expect(result.current.visibleEvents[0]).toMatchObject({
            start: "2026-05-05",
            end: "2026-05-06",
            allDay: true,
        });
        expect(result.current.visibleEvents[0].extendedProps).toMatchObject({
            detailAllDay: true,
            startReadableDate: "2026-05-05",
            endReadableDate: "2026-05-05",
        });

        rerender({ calendarTimeZone: "America/Matamoros" });

        expect(result.current.visibleEvents[0]).toMatchObject({
            start: "2026-05-05T01:00:00",
            end: "2026-05-06T01:00:00",
            allDay: false,
        });
        expect(result.current.visibleEvents[0].extendedProps).toMatchObject({
            startDate: "2026-05-05",
            endDate: "2026-05-05",
            startReadableDate: "2026-05-05",
            endReadableDate: "2026-05-06",
            totalDays: 1,
            usedDays: 1,
        });
    });

    it("adapta eventos con hora entre horario central de México y horario foráneo", async () => {
        const event = {
            focus: "eventos",
            name: "Taller",
            scope: "global",
            type: "General",
            start: "2026-05-05T15:00:00.000Z",
            end: "2026-05-05T16:30:00.000Z",
            allDay: false,
            isFreeDay: false,
        };

        const { result, rerender } = renderHook(
            ({ calendarTimeZone }) =>
                useCalendarFilters([event], {
                    isList: false,
                    viewerRole: "Psicóloga",
                    calendarTimeZone,
                }),
            {
                initialProps: {
                    calendarTimeZone: "America/Mexico_City",
                },
            },
        );

        await waitFor(() => expect(getEventsTypes).toHaveBeenCalledTimes(1));
        await waitFor(() =>
            expect(result.current.visibleEvents).toHaveLength(1),
        );

        expect(result.current.visibleEvents[0]).toMatchObject({
            start: "2026-05-05T09:00:00",
            end: "2026-05-05T10:30:00",
            allDay: false,
        });

        rerender({ calendarTimeZone: "America/Matamoros" });

        expect(result.current.visibleEvents[0]).toMatchObject({
            start: "2026-05-05T10:00:00",
            end: "2026-05-05T11:30:00",
            allDay: false,
        });
    });

    it("renderiza eventos de casa o personales que terminan a las 12:00 sin extenderlos al día siguiente", async () => {
        const events = [
            {
                focus: "eventos",
                name: "Evento casa mediodía",
                scope: "house",
                type: "General",
                start: "2026-05-05T10:00:00.000Z",
                end: "2026-05-05T11:00:00.000Z",
                allDay: false,
                isFreeDay: false,
            },
            {
                focus: "eventos",
                name: "Evento personal mediodía",
                scope: "personal",
                type: "General",
                start: "2026-05-05T10:00:00.000Z",
                end: "2026-05-05T11:00:00.000Z",
                allDay: false,
                isFreeDay: false,
                peopleInsideEvent: [{ id: "employee-worker", name: "John Smith" }],
            },
        ];

        const { result } = renderHook(() =>
            useCalendarFilters(events, {
                isList: false,
                viewerRole: "Psicóloga",
                calendarTimeZone: "Europe/London",
            }),
        );

        await waitFor(() => expect(getEventsTypes).toHaveBeenCalledTimes(1));
        await waitFor(() =>
            expect(result.current.visibleEvents).toHaveLength(2),
        );

        expect(result.current.visibleEvents.map((visibleEvent) => ({
            title: visibleEvent.title,
            start: visibleEvent.start,
            end: visibleEvent.end,
            allDay: visibleEvent.allDay,
            startDate: visibleEvent.extendedProps.startDate,
            endDate: visibleEvent.extendedProps.endDate,
            startReadableDate: visibleEvent.extendedProps.startReadableDate,
            endReadableDate: visibleEvent.extendedProps.endReadableDate,
        }))).toEqual([
            {
                title: "Evento casa mediodía",
                start: "2026-05-05T11:00:00",
                end: "2026-05-05T12:00:00",
                allDay: false,
                startDate: "2026-05-05",
                endDate: "2026-05-05",
                startReadableDate: "2026-05-05",
                endReadableDate: "2026-05-05",
            },
            {
                title: "Evento personal mediodía",
                start: "2026-05-05T11:00:00",
                end: "2026-05-05T12:00:00",
                allDay: false,
                startDate: "2026-05-05",
                endDate: "2026-05-05",
                startReadableDate: "2026-05-05",
                endReadableDate: "2026-05-05",
            },
        ]);
    });

    it("segmenta eventos multi-día en semana usando el timezone activo", async () => {
        const event = {
            focus: "eventos",
            name: "Guardia nocturna",
            scope: "house",
            type: "General",
            start: "2026-05-04T23:30:00.000Z",
            end: "2026-05-05T23:30:00.000Z",
            allDay: false,
            isFreeDay: false,
        };

        const { result } = renderHook(() =>
            useCalendarFilters([event], {
                isList: false,
                viewerRole: "Psicóloga",
                calendarTimeZone: "Europe/London",
                calendarView: "timeGridWeek",
            }),
        );

        await waitFor(() => expect(getEventsTypes).toHaveBeenCalledTimes(1));
        await waitFor(() =>
            expect(result.current.visibleEvents).toHaveLength(2),
        );

        expect(result.current.visibleEvents.map((visibleEvent) => ({
            start: visibleEvent.start,
            end: visibleEvent.end,
            allDay: visibleEvent.allDay,
            sourceStart: visibleEvent.extendedProps.sourceStart,
            sourceEnd: visibleEvent.extendedProps.sourceEnd,
        }))).toEqual([
            {
                start: "2026-05-05T00:30:00",
                end: "2026-05-06T00:00:00",
                allDay: false,
                sourceStart: "2026-05-04T23:30:00.000Z",
                sourceEnd: "2026-05-05T23:30:00.000Z",
            },
            {
                start: "2026-05-06T00:00:00",
                end: "2026-05-06T00:30:00",
                allDay: false,
                sourceStart: "2026-05-04T23:30:00.000Z",
                sourceEnd: "2026-05-05T23:30:00.000Z",
            },
        ]);
        expect(result.current.visibleEvents[0].extendedProps).toMatchObject({
            startDate: "2026-05-05",
            endDate: "2026-05-06",
            startReadableDate: "2026-05-05",
            endReadableDate: "2026-05-06",
        });
    });

    it("pinta solo los días completos como all-day en registros de varios días", async () => {
        const event = {
            focus: "eventos",
            name: "Guardia extendida",
            scope: "house",
            type: "General",
            start: "2026-05-04T07:00:00.000Z",
            end: "2026-05-06T07:00:00.000Z",
            allDay: false,
            isFreeDay: false,
        };

        const { result } = renderHook(() =>
            useCalendarFilters([event], {
                isList: false,
                viewerRole: "Psicóloga",
                calendarTimeZone: "UTC",
                calendarView: "timeGridWeek",
            }),
        );

        await waitFor(() => expect(getEventsTypes).toHaveBeenCalledTimes(1));
        await waitFor(() =>
            expect(result.current.visibleEvents).toHaveLength(3),
        );

        expect(result.current.visibleEvents.map((visibleEvent) => ({
            start: visibleEvent.start,
            end: visibleEvent.end,
            allDay: visibleEvent.allDay,
            utcStart: visibleEvent.extendedProps.utcStart,
            utcEnd: visibleEvent.extendedProps.utcEnd,
            startDate: visibleEvent.extendedProps.startDate,
            endDate: visibleEvent.extendedProps.endDate,
        }))).toEqual([
            {
                start: "2026-05-04T07:00:00",
                end: "2026-05-05T00:00:00",
                allDay: false,
                utcStart: "2026-05-04T07:00:00.000Z",
                utcEnd: "2026-05-06T07:00:00.000Z",
                startDate: "2026-05-04",
                endDate: "2026-05-06",
            },
            {
                start: "2026-05-05",
                end: "2026-05-06",
                allDay: true,
                utcStart: "2026-05-04T07:00:00.000Z",
                utcEnd: "2026-05-06T07:00:00.000Z",
                startDate: "2026-05-04",
                endDate: "2026-05-06",
            },
            {
                start: "2026-05-06T00:00:00",
                end: "2026-05-06T07:00:00",
                allDay: false,
                utcStart: "2026-05-04T07:00:00.000Z",
                utcEnd: "2026-05-06T07:00:00.000Z",
                startDate: "2026-05-04",
                endDate: "2026-05-06",
            },
        ]);
    });

    it("agrupa días completos consecutivos como un solo registro all-day en semana", async () => {
        const event = {
            focus: "eventos",
            name: "Guardia larga",
            scope: "house",
            type: "General",
            start: "2026-05-04T07:00:00.000Z",
            end: "2026-05-08T07:00:00.000Z",
            allDay: false,
            isFreeDay: false,
        };

        const { result } = renderHook(() =>
            useCalendarFilters([event], {
                isList: false,
                viewerRole: "Psicóloga",
                calendarTimeZone: "UTC",
                calendarView: "timeGridWeek",
            }),
        );

        await waitFor(() => expect(getEventsTypes).toHaveBeenCalledTimes(1));
        await waitFor(() =>
            expect(result.current.visibleEvents).toHaveLength(3),
        );

        expect(result.current.visibleEvents.map((visibleEvent) => ({
            start: visibleEvent.start,
            end: visibleEvent.end,
            allDay: visibleEvent.allDay,
            sourceStart: visibleEvent.extendedProps.sourceStart,
            sourceEnd: visibleEvent.extendedProps.sourceEnd,
        }))).toEqual([
            {
                start: "2026-05-04T07:00:00",
                end: "2026-05-05T00:00:00",
                allDay: false,
                sourceStart: "2026-05-04T07:00:00.000Z",
                sourceEnd: "2026-05-08T07:00:00.000Z",
            },
            {
                start: "2026-05-05",
                end: "2026-05-08",
                allDay: true,
                sourceStart: "2026-05-04T07:00:00.000Z",
                sourceEnd: "2026-05-08T07:00:00.000Z",
            },
            {
                start: "2026-05-08T00:00:00",
                end: "2026-05-08T07:00:00",
                allDay: false,
                sourceStart: "2026-05-04T07:00:00.000Z",
                sourceEnd: "2026-05-08T07:00:00.000Z",
            },
        ]);
    });

    it("mantiene eventos all-day 00:00 a 00:00 como all-day en su horario base", async () => {
        const event = {
            focus: "eventos",
            name: "Retiro",
            scope: "global",
            type: "General",
            start: "2026-05-05T06:00:00.000Z",
            end: "2026-05-06T06:00:00.000Z",
            allDay: true,
            isFreeDay: false,
        };

        const { result, rerender } = renderHook(
            ({ calendarTimeZone }) =>
                useCalendarFilters([event], {
                    isList: false,
                    viewerRole: "Psicóloga",
                    calendarTimeZone,
                }),
            {
                initialProps: {
                    calendarTimeZone: "America/Mexico_City",
                },
            },
        );

        await waitFor(() => expect(getEventsTypes).toHaveBeenCalledTimes(1));
        await waitFor(() =>
            expect(result.current.visibleEvents).toHaveLength(1),
        );

        expect(result.current.visibleEvents[0]).toMatchObject({
            start: "2026-05-05",
            end: "2026-05-06",
            allDay: true,
        });

        rerender({ calendarTimeZone: "America/Matamoros" });

        expect(result.current.visibleEvents[0]).toMatchObject({
            start: "2026-05-05T01:00:00",
            end: "2026-05-06T01:00:00",
            allDay: false,
        });
    });

    it("mantiene all-day real en la fila superior de semana", async () => {
        const event = {
            focus: "eventos",
            name: "Retiro",
            scope: "global",
            type: "General",
            start: "2026-05-05T06:00:00.000Z",
            end: "2026-05-07T06:00:00.000Z",
            allDay: true,
            isFreeDay: false,
        };

        const { result } = renderHook(() =>
            useCalendarFilters([event], {
                isList: false,
                viewerRole: "Psicóloga",
                calendarTimeZone: "America/Mexico_City",
                calendarView: "timeGridWeek",
            }),
        );

        await waitFor(() => expect(getEventsTypes).toHaveBeenCalledTimes(1));
        await waitFor(() =>
            expect(result.current.visibleEvents).toHaveLength(1),
        );

        expect(result.current.visibleEvents[0]).toMatchObject({
            start: "2026-05-05",
            end: "2026-05-07",
            allDay: true,
        });
        expect(result.current.visibleEvents[0].extendedProps).toMatchObject({
            detailAllDay: true,
            startReadableDate: "2026-05-05",
            endReadableDate: "2026-05-06",
        });
    });

    it("expande en lista los eventos all-day con desfase y agrega Día x/x", async () => {
        const event = {
            focus: "eventos",
            name: "Retiro",
            scope: "global",
            type: "General",
            start: "2026-05-05T06:00:00.000Z",
            end: "2026-05-06T06:00:00.000Z",
            allDay: true,
            isFreeDay: true,
        };

        const { result } = renderHook(() =>
            useCalendarFilters([event], {
                isList: true,
                viewerRole: "Psicóloga",
                calendarTimeZone: "America/Matamoros",
            }),
        );

        await waitFor(() => expect(getEventsTypes).toHaveBeenCalledTimes(1));
        await waitFor(() =>
            expect(result.current.visibleEvents).toHaveLength(2),
        );

        expect(result.current.visibleEvents.map((visibleEvent) => ({
            start: visibleEvent.start,
            end: visibleEvent.end,
            currentDayIndex: visibleEvent.extendedProps.currentDayIndex,
            totalDays: visibleEvent.extendedProps.totalDays,
        }))).toEqual([
            {
                start: "2026-05-05T01:00:00",
                end: "2026-05-06T00:00:00",
                currentDayIndex: 1,
                totalDays: 2,
            },
            {
                start: "2026-05-06T00:00:00",
                end: "2026-05-06T01:00:00",
                currentDayIndex: 2,
                totalDays: 2,
            },
        ]);
    });

    it("marca como Todo el día solo el segmento completo en lista y mantiene el rango real para detalle", async () => {
        const event = {
            focus: "vacaciones",
            vacationId: "vacation-list-detail",
            employeeId: "employee-worker",
            name: "John Smith",
            type: "Vacaciones",
            start: "2026-05-05T06:00:00.000Z",
            end: "2026-05-07T06:00:00.000Z",
            startDate: "2026-05-05",
            endDate: "2026-05-07",
            allDay: true,
            status: 1,
            usedDays: 2,
            totalDays: 3,
        };

        const { result } = renderHook(() =>
            useCalendarFilters([event], {
                isList: true,
                viewerRole: "Psicóloga",
                calendarTimeZone: "America/Matamoros",
            }),
        );

        await waitFor(() => expect(getEventsTypes).toHaveBeenCalledTimes(1));
        await waitFor(() =>
            expect(result.current.visibleEvents).toHaveLength(3),
        );

        expect(result.current.visibleEvents.map((visibleEvent) => ({
            start: visibleEvent.start,
            end: visibleEvent.end,
            allDay: visibleEvent.allDay,
            currentDayIndex: visibleEvent.extendedProps.currentDayIndex,
            startDate: visibleEvent.extendedProps.startDate,
            endDate: visibleEvent.extendedProps.endDate,
            detailAllDay: visibleEvent.extendedProps.detailAllDay,
        }))).toEqual([
            {
                start: "2026-05-05T01:00:00",
                end: "2026-05-06T00:00:00",
                allDay: false,
                currentDayIndex: 1,
                startDate: "2026-05-05",
                endDate: "2026-05-07",
                detailAllDay: false,
            },
            {
                start: "2026-05-06",
                end: "2026-05-07",
                allDay: true,
                currentDayIndex: 2,
                startDate: "2026-05-05",
                endDate: "2026-05-07",
                detailAllDay: false,
            },
            {
                start: "2026-05-07T00:00:00",
                end: "2026-05-07T01:00:00",
                allDay: false,
                currentDayIndex: 3,
                startDate: "2026-05-05",
                endDate: "2026-05-07",
                detailAllDay: false,
            },
        ]);
    });

    it("segmenta vacaciones y ausencias en semana sin cambiar el rango usado por detalle", async () => {
        const vacation = {
            focus: "vacaciones",
            vacationId: "vacation-timegrid-detail",
            employeeId: "employee-worker",
            name: "John Smith",
            type: "Vacaciones",
            start: "2026-05-05T06:00:00.000Z",
            end: "2026-05-07T06:00:00.000Z",
            startDate: "2026-05-05",
            endDate: "2026-05-07",
            allDay: true,
            status: 1,
            usedDays: 2,
            totalDays: 3,
        };
        const absence = buildAbsence({
            absenceId: "absence-timegrid-detail",
            start: "2026-05-05T06:00:00.000Z",
            end: "2026-05-07T06:00:00.000Z",
            startDate: "2026-05-05",
            endDate: "2026-05-07",
            totalDays: 3,
        });

        const { result } = renderHook(() =>
            useCalendarFilters([vacation, absence], {
                isList: false,
                viewerRole: "Psicóloga",
                calendarTimeZone: "America/Matamoros",
                calendarView: "timeGridWeek",
            }),
        );

        await waitFor(() => expect(getEventsTypes).toHaveBeenCalledTimes(1));
        await waitFor(() =>
            expect(result.current.visibleEvents).toHaveLength(6),
        );

        const vacationSegments = result.current.visibleEvents.filter(
            (visibleEvent) =>
                visibleEvent.extendedProps.vacationId ===
                "vacation-timegrid-detail",
        );
        const absenceSegments = result.current.visibleEvents.filter(
            (visibleEvent) =>
                visibleEvent.extendedProps.absenceId ===
                "absence-timegrid-detail",
        );

        expect(vacationSegments.map((visibleEvent) => ({
            start: visibleEvent.start,
            end: visibleEvent.end,
            allDay: visibleEvent.allDay,
            startDate: visibleEvent.extendedProps.startDate,
            endDate: visibleEvent.extendedProps.endDate,
            sourceStart: visibleEvent.extendedProps.sourceStart,
            sourceEnd: visibleEvent.extendedProps.sourceEnd,
        }))).toEqual([
            {
                start: "2026-05-05T01:00:00",
                end: "2026-05-06T00:00:00",
                allDay: false,
                startDate: "2026-05-05",
                endDate: "2026-05-07",
                sourceStart: "2026-05-05T06:00:00.000Z",
                sourceEnd: "2026-05-07T06:00:00.000Z",
            },
            {
                start: "2026-05-06",
                end: "2026-05-07",
                allDay: true,
                startDate: "2026-05-05",
                endDate: "2026-05-07",
                sourceStart: "2026-05-05T06:00:00.000Z",
                sourceEnd: "2026-05-07T06:00:00.000Z",
            },
            {
                start: "2026-05-07T00:00:00",
                end: "2026-05-07T01:00:00",
                allDay: false,
                startDate: "2026-05-05",
                endDate: "2026-05-07",
                sourceStart: "2026-05-05T06:00:00.000Z",
                sourceEnd: "2026-05-07T06:00:00.000Z",
            },
        ]);
        expect(absenceSegments.map((visibleEvent) => ({
            start: visibleEvent.start,
            end: visibleEvent.end,
            allDay: visibleEvent.allDay,
            startDate: visibleEvent.extendedProps.startDate,
            endDate: visibleEvent.extendedProps.endDate,
        }))).toEqual([
            {
                start: "2026-05-05T01:00:00",
                end: "2026-05-06T00:00:00",
                allDay: false,
                startDate: "2026-05-05",
                endDate: "2026-05-07",
            },
            {
                start: "2026-05-06",
                end: "2026-05-07",
                allDay: true,
                startDate: "2026-05-05",
                endDate: "2026-05-07",
            },
            {
                start: "2026-05-07T00:00:00",
                end: "2026-05-07T01:00:00",
                allDay: false,
                startDate: "2026-05-05",
                endDate: "2026-05-07",
            },
        ]);
    });

    it("agrupa días completos consecutivos de vacaciones y ausencias como un solo registro all-day en semana", async () => {
        const vacation = {
            focus: "vacaciones",
            vacationId: "vacation-long-timegrid",
            employeeId: "employee-worker",
            name: "John Smith",
            type: "Vacaciones",
            start: "2026-05-05T06:00:00.000Z",
            end: "2026-05-09T06:00:00.000Z",
            startDate: "2026-05-05",
            endDate: "2026-05-09",
            allDay: true,
            status: 1,
            usedDays: 4,
            totalDays: 5,
        };
        const absence = buildAbsence({
            absenceId: "absence-long-timegrid",
            start: "2026-05-05T06:00:00.000Z",
            end: "2026-05-09T06:00:00.000Z",
            startDate: "2026-05-05",
            endDate: "2026-05-09",
            totalDays: 5,
        });

        const { result } = renderHook(() =>
            useCalendarFilters([vacation, absence], {
                isList: false,
                viewerRole: "Psicóloga",
                calendarTimeZone: "America/Matamoros",
                calendarView: "timeGridWeek",
            }),
        );

        await waitFor(() => expect(getEventsTypes).toHaveBeenCalledTimes(1));
        await waitFor(() =>
            expect(result.current.visibleEvents).toHaveLength(6),
        );

        const vacationSegments = result.current.visibleEvents.filter(
            (visibleEvent) =>
                visibleEvent.extendedProps.vacationId ===
                "vacation-long-timegrid",
        );
        const absenceSegments = result.current.visibleEvents.filter(
            (visibleEvent) =>
                visibleEvent.extendedProps.absenceId ===
                "absence-long-timegrid",
        );

        const visibleShape = (visibleEvent) => ({
            start: visibleEvent.start,
            end: visibleEvent.end,
            allDay: visibleEvent.allDay,
            startDate: visibleEvent.extendedProps.startDate,
            endDate: visibleEvent.extendedProps.endDate,
        });

        expect(vacationSegments.map(visibleShape)).toEqual([
            {
                start: "2026-05-05T01:00:00",
                end: "2026-05-06T00:00:00",
                allDay: false,
                startDate: "2026-05-05",
                endDate: "2026-05-09",
            },
            {
                start: "2026-05-06",
                end: "2026-05-09",
                allDay: true,
                startDate: "2026-05-05",
                endDate: "2026-05-09",
            },
            {
                start: "2026-05-09T00:00:00",
                end: "2026-05-09T01:00:00",
                allDay: false,
                startDate: "2026-05-05",
                endDate: "2026-05-09",
            },
        ]);
        expect(absenceSegments.map(visibleShape)).toEqual([
            {
                start: "2026-05-05T01:00:00",
                end: "2026-05-06T00:00:00",
                allDay: false,
                startDate: "2026-05-05",
                endDate: "2026-05-09",
            },
            {
                start: "2026-05-06",
                end: "2026-05-09",
                allDay: true,
                startDate: "2026-05-05",
                endDate: "2026-05-09",
            },
            {
                start: "2026-05-09T00:00:00",
                end: "2026-05-09T01:00:00",
                allDay: false,
                startDate: "2026-05-05",
                endDate: "2026-05-09",
            },
        ]);
    });

    it("adapta eventos freeDay al cambiar entre horario central de México y horario foráneo", async () => {
        const event = {
            focus: "eventos",
            name: "Día libre",
            scope: "global",
            type: "General",
            start: "2026-05-05T06:00:00.000Z",
            end: "2026-05-06T06:00:00.000Z",
            allDay: true,
            isFreeDay: true,
        };

        const { result, rerender } = renderHook(
            ({ calendarTimeZone }) =>
                useCalendarFilters([event], {
                    isList: false,
                    viewerRole: "Psicóloga",
                    calendarTimeZone,
                }),
            {
                initialProps: {
                    calendarTimeZone: "America/Mexico_City",
                },
            },
        );

        await waitFor(() => expect(getEventsTypes).toHaveBeenCalledTimes(1));
        await waitFor(() =>
            expect(result.current.visibleEvents).toHaveLength(1),
        );

        expect(result.current.visibleEvents[0]).toMatchObject({
            start: "2026-05-05",
            end: "2026-05-06",
            allDay: true,
        });

        rerender({ calendarTimeZone: "America/Matamoros" });

        expect(result.current.visibleEvents[0]).toMatchObject({
            start: "2026-05-05T01:00:00",
            end: "2026-05-06T01:00:00",
            allDay: false,
        });
        expect(result.current.visibleEvents[0].extendedProps.isFreeDay).toBe(
            true,
        );
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
            expect(result.current.absenceTypeFilters).toEqual([
                "médica",
                "personal",
            ]);
        });
        await waitFor(() => {
            expect(
                result.current.visibleEvents.map(
                    (event) => event.extendedProps.absenceId,
                ),
            ).toEqual(expect.arrayContaining(["medica", "personal"]));
        });
    });

    it("quita detailAllDay cuando un evento all-day no cae como todo el día en la zona activa", async () => {
        const event = {
            focus: "eventos",
            name: "Capacitacion all-day",
            scope: "personal",
            type: "Capacitaciones",
            start: "2026-05-05T06:00:00.000Z",
            end: "2026-05-06T06:00:00.000Z",
            allDay: true,
            trainer: "Dra. Martinez",
            peopleInsideEvent: [{ id: "employee-worker", name: "John Smith" }],
        };

        const { result } = renderHook(() =>
            useCalendarFilters([event], {
                isList: false,
                viewerRole: "Psicóloga",
                calendarTimeZone: "America/Matamoros",
            }),
        );

        await waitFor(() => expect(getEventsTypes).toHaveBeenCalledTimes(1));
        await waitFor(() =>
            expect(result.current.visibleEvents).toHaveLength(1),
        );

        expect(result.current.visibleEvents[0]).toMatchObject({
            start: "2026-05-05T01:00:00",
            end: "2026-05-06T01:00:00",
            allDay: false,
        });
        expect(result.current.visibleEvents[0].extendedProps).toMatchObject({
            detailAllDay: false,
            startReadableDate: "2026-05-05",
            endReadableDate: "2026-05-06",
        });
    });
});
