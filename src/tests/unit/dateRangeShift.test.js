import { describe, expect, it } from "vitest";

import {
    shiftDateOnlyRange,
    shiftDateTimeRange,
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
});
