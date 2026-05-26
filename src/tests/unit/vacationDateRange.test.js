import { describe, expect, it } from "vitest";
import {
    formatDateOnly,
    getVacationDateRangeValues,
    getVacationEndDateMin,
    isDateWithinVacationRange,
} from "../../utils/vacationDateRange";
import { getVacationFormErrors } from "../../utils/schema/vacation/vacation.schema";

describe("vacationDateRange", () => {
    const baseDate = new Date(2026, 4, 26);

    it("calcula un rango inclusivo de 3 años hacia atrás y adelante", () => {
        expect(getVacationDateRangeValues(baseDate)).toEqual({
            minDate: "2023-05-26",
            maxDate: "2029-05-26",
        });

        expect(isDateWithinVacationRange("2023-05-26", baseDate)).toBe(true);
        expect(isDateWithinVacationRange("2029-05-26", baseDate)).toBe(true);
        expect(isDateWithinVacationRange("2023-05-25", baseDate)).toBe(false);
        expect(isDateWithinVacationRange("2029-05-27", baseDate)).toBe(false);
    });

    it("usa la fecha inicial como mínimo de fin solo cuando está dentro del rango", () => {
        const fallbackMin = new Date(2023, 4, 26);
        const maxDate = new Date(2029, 4, 26);

        expect(
            formatDateOnly(
                getVacationEndDateMin("2026-06-01", fallbackMin, maxDate),
            ),
        ).toBe("2026-06-01");

        expect(
            formatDateOnly(
                getVacationEndDateMin("2030-01-01", fallbackMin, maxDate),
            ),
        ).toBe("2023-05-26");
    });

    it("bloquea fechas extremas en el schema de creación", () => {
        const result = getVacationFormErrors({
            employeeId: "emp-1",
            startDate: "1900-01-01",
            endDate: "9999-12-31",
        });

        expect(result.success).toBe(false);
        expect(result.errors.startDate).toMatch(/3 años/i);
        expect(result.errors.endDate).toMatch(/3 años/i);
    });
});
