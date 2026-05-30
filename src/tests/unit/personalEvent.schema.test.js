import { describe, expect, it } from "vitest";

import { buildPersonalPayload } from "../../utils/schema/evento/personalEvent.schema";
import {
    getPersonalEventMexicoRangeError,
    PERSONAL_EVENT_MEXICO_RANGE_ERROR,
} from "../../utils/schema/evento/personalEventRules";

const baseForm = {
    eventTypeId: "11111111-1111-4111-8111-111111111111",
    name: "Cita médica",
    description: "",
    forceOverlap: false,
    employeeIds: [],
    date: "2026-06-05",
};

describe("personalEvent buildPersonalPayload", () => {
    it("respeta la fecha final en horario local foráneo", () => {
        expect(
            buildPersonalPayload({
                ...baseForm,
                allDay: false,
                endDate: "2026-06-06",
                startTime: "07:00",
                endTime: "07:00",
                timeZone: "Europe/London",
            }),
        ).toMatchObject({
            date: "2026-06-05",
            start: "2026-06-05T06:00:00.000Z",
            end: "2026-06-06T06:00:00.000Z",
            timeZone: "Europe/London",
        });
    });

    it("guarda eventos personales de todo el día con base en México central", () => {
        expect(
            buildPersonalPayload({
                ...baseForm,
                allDay: true,
                timeZone: "Europe/London",
            }),
        ).toMatchObject({
            start: "2026-06-05T06:00:00.000Z",
            end: "2026-06-06T06:00:00.000Z",
            timeZone: "America/Mexico_City",
        });
    });
});

describe("personalEvent México range rules", () => {
    it("bloquea rangos que cruzan más de un día mexicano", () => {
        expect(
            getPersonalEventMexicoRangeError({
                startDate: "2026-06-05",
                endDate: "2026-06-05",
                startTime: "06:30",
                endTime: "08:00",
                allDay: false,
                calendarTimeZone: "Europe/London",
            }),
        ).toBe(PERSONAL_EVENT_MEXICO_RANGE_ERROR);
    });

    it("permite rangos foráneos que cierran en la medianoche mexicana", () => {
        expect(
            getPersonalEventMexicoRangeError({
                startDate: "2026-06-05",
                endDate: "2026-06-06",
                startTime: "07:00",
                endTime: "07:00",
                allDay: false,
                calendarTimeZone: "Europe/London",
            }),
        ).toBe("");
    });
});
