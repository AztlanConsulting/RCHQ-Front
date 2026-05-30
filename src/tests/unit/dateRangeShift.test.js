import { describe, expect, it } from "vitest";

import {
    shiftDateOnlyRange,
    shiftDateTimeRange,
    shiftSameDayTimeRange,
} from "../../utils/dateRangeShift";

describe("dateRangeShift", () => {
    it("moves an end date by the same number of days as the start date", () => {
        const result = shiftDateOnlyRange(
            {
                startDate: "2026-05-27",
                endDate: "2026-05-30",
            },
            "2026-06-02",
        );

        expect(result).toMatchObject({
            startDate: "2026-06-02",
            endDate: "2026-06-05",
        });
    });

    it("keeps the full datetime duration when moving a timed start date", () => {
        const result = shiftDateTimeRange(
            {
                allDay: false,
                startDate: "2026-05-27",
                startTime: "21:00",
                endDate: "2026-05-27",
                endTime: "23:00",
            },
            "startDate",
            "2026-05-28",
        );

        expect(result).toMatchObject({
            startDate: "2026-05-28",
            startTime: "21:00",
            endDate: "2026-05-28",
            endTime: "23:00",
        });
    });

    it("moves the end date when a timed start time crosses midnight", () => {
        const result = shiftDateTimeRange(
            {
                allDay: false,
                startDate: "2026-05-27",
                startTime: "21:00",
                endDate: "2026-05-27",
                endTime: "23:00",
            },
            "startTime",
            "23:00",
        );

        expect(result).toMatchObject({
            startDate: "2026-05-27",
            startTime: "23:00",
            endDate: "2026-05-28",
            endTime: "01:00",
        });
    });

    it("keeps the duration in hours when moving a same-day start time", () => {
        const result = shiftSameDayTimeRange(
            {
                allDay: false,
                startTime: "09:00",
                endTime: "10:30",
            },
            "startTime",
            "11:00",
        );

        expect(result).toMatchObject({
            startTime: "11:00",
            endTime: "12:30",
        });
    });

    it("caps a same-day end time before midnight", () => {
        const result = shiftSameDayTimeRange(
            {
                allDay: false,
                startTime: "21:00",
                endTime: "23:00",
            },
            "startTime",
            "23:00",
        );

        expect(result).toMatchObject({
            startTime: "23:00",
            endTime: "23:59",
        });
    });
});
