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

    it("calcula un rango inclusivo de 1 mes atrás y 18 meses adelante", () => {
        expect(getVacationDateRangeValues(baseDate)).toEqual({
            minDate: "2026-04-26",
            maxDate: "2027-11-26",
        });

        expect(isDateWithinVacationRange("2026-04-26", baseDate)).toBe(true);
        expect(isDateWithinVacationRange("2027-11-26", baseDate)).toBe(true);
        expect(isDateWithinVacationRange("2026-04-25", baseDate)).toBe(false);
        expect(isDateWithinVacationRange("2027-11-27", baseDate)).toBe(false);
    });

    it("ajusta el día cuando el mes límite no tiene el mismo número de días", () => {
        expect(getVacationDateRangeValues(new Date(2026, 2, 31))).toEqual({
            minDate: "2026-02-28",
            maxDate: "2027-09-30",
        });
    });

    it("usa la fecha inicial como mínimo de fin solo cuando está dentro del rango", () => {
        const fallbackMin = new Date(2026, 3, 26);
        const maxDate = new Date(2027, 10, 26);

        expect(
            formatDateOnly(
                getVacationEndDateMin("2026-06-01", fallbackMin, maxDate),
            ),
        ).toBe("2026-06-01");

        expect(
            formatDateOnly(
                getVacationEndDateMin("2028-01-01", fallbackMin, maxDate),
            ),
        ).toBe("2026-04-26");
    });

    it("bloquea fechas extremas en el schema de creación", () => {
        const result = getVacationFormErrors({
            employeeId: "emp-1",
            startDate: "1900-01-01",
            endDate: "9999-12-31",
        });

        expect(result.success).toBe(false);
        expect(result.errors.startDate).toMatch(/1 mes/i);
        expect(result.errors.endDate).toMatch(/1\.5 años/i);
    });
});
