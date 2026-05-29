import { describe, expect, it } from "vitest";
import {
    getAllDayRangeInTimeZone,
    getCalendarNowValue,
    zonedDateTimeToIso,
} from "../../utils/timeZone";

describe("timeZone utils", () => {
    it("calcula el now flotante del calendario con el día de la zona activa", () => {
        const currentInstant = new Date("2026-05-26T05:30:00.000Z");

        expect(
            getCalendarNowValue("America/Matamoros", currentInstant),
        ).toBe("2026-05-26T00:30:00");
        expect(
            getCalendarNowValue("America/Mexico_City", currentInstant),
        ).toBe("2026-05-25T23:30:00");
    });

    it("mantiene all-day cuando el rango cae de 00:00 a 23:59 en la zona activa", () => {
        const start = "2026-05-05T06:00:00.000Z";
        const end = "2026-05-06T05:59:59.999Z";

        expect(
            getAllDayRangeInTimeZone(start, end, "America/Mexico_City"),
        ).toEqual({
            isAllDay: true,
            startDate: "2026-05-05",
            displayEndDate: "2026-05-05",
            calendarEndDate: "2026-05-06",
        });
        expect(
            getAllDayRangeInTimeZone(start, end, "America/Matamoros"),
        ).toEqual({ isAllDay: false });
    });

    it("mantiene all-day cuando el rango cae de 00:00 a 00:00 en la zona activa", () => {
        const start = "2026-05-05T06:00:00.000Z";
        const end = "2026-05-06T06:00:00.000Z";

        expect(
            getAllDayRangeInTimeZone(start, end, "America/Mexico_City"),
        ).toEqual({
            isAllDay: true,
            startDate: "2026-05-05",
            displayEndDate: "2026-05-05",
            calendarEndDate: "2026-05-06",
        });
        expect(
            getAllDayRangeInTimeZone(start, end, "America/Matamoros"),
        ).toEqual({ isAllDay: false });
    });

    it("convierte una hora capturada en la zona elegida a UTC", () => {
        expect(
            zonedDateTimeToIso("2026-05-05", "02:00", "America/Mexico_City"),
        ).toBe("2026-05-05T08:00:00.000Z");
        expect(
            zonedDateTimeToIso("2026-05-05", "02:00", "America/Matamoros"),
        ).toBe("2026-05-05T07:00:00.000Z");
    });
});
