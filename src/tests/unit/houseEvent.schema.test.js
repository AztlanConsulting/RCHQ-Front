import { describe, expect, it } from "vitest";
import { buildPayload } from "../../utils/schema/evento/houseEvent.schema";

const baseForm = {
    eventTypeId: "11111111-1111-4111-8111-111111111111",
    name: "Limpieza",
    description: "Preparar casa",
    forceOverlap: false,
    startDate: "2026-05-05",
    endDate: "2026-05-05",
};

describe("houseEvent buildPayload", () => {
    it("guarda eventos con hora como UTC desde el horario del calendario", () => {
        expect(
            buildPayload({
                ...baseForm,
                allDay: false,
                isFreeDay: false,
                startTime: "02:00",
                endTime: "03:30",
                timeZone: "America/Matamoros",
            }),
        ).toMatchObject({
            start: "2026-05-05T07:00:00.000Z",
            end: "2026-05-05T08:30:00.000Z",
            allDay: false,
            timeZone: "America/Matamoros",
        });
    });

    it("guarda eventos all-day como rango UTC de 00:00 a 00:00 en el horario del calendario", () => {
        expect(
            buildPayload({
                ...baseForm,
                allDay: true,
                isFreeDay: false,
                timeZone: "Europe/Madrid",
            }),
        ).toMatchObject({
            start: "2026-05-04T22:00:00.000Z",
            end: "2026-05-05T22:00:00.000Z",
            allDay: true,
            timeZone: "Europe/Madrid",
        });
    });

    it("guarda freeDay como día mexicano para que el back lo contabilice", () => {
        expect(
            buildPayload({
                ...baseForm,
                allDay: true,
                isFreeDay: true,
                timeZone: "Europe/Madrid",
            }),
        ).toMatchObject({
            start: "2026-05-05",
            end: "2026-05-05",
            allDay: true,
            isFreeDay: true,
            timeZone: "America/Mexico_City",
        });
    });
});
