import { describe, it, expect } from "vitest";
import Dates from "../../utils/helpers/dates";
import Strings from "../../utils/helpers/strings";
import CalendarUtils from "../../utils/calendar.utils";

describe("Dates.formatDate", () => {
    it("formatea fechas válidas en formato es-MX", () => {
        expect(Dates.formatDate("2026-05-15T00:00:00.000Z")).toBe("15/05/2026");
    });

    it("regresa guion cuando no hay fecha", () => {
        expect(Dates.formatDate(null)).toBe("-");
        expect(Dates.formatDate(undefined)).toBe("-");
        expect(Dates.formatDate("")).toBe("-");
    });

    it("regresa guion cuando la fecha es inválida", () => {
        expect(Dates.formatDate("fecha inválida")).toBe("-");
    });
});

describe("Strings.getSafeText", () => {
    it("regresa el texto limpio cuando existe", () => {
        expect(Strings.getSafeText("  Ana Pendiente  ")).toBe("Ana Pendiente");
    });

    it("regresa fallback cuando el valor es null, undefined o vacío", () => {
        expect(Strings.getSafeText(null)).toBe("-");
        expect(Strings.getSafeText(undefined)).toBe("-");
        expect(Strings.getSafeText("   ")).toBe("-");
    });

    it("permite fallback personalizado", () => {
        expect(Strings.getSafeText("", "Sin dato")).toBe("Sin dato");
    });
});

describe("CalendarUtils.getVacationStatusClassName", () => {
    it("regresa clase verde para aprobada", () => {
        expect(CalendarUtils.getVacationStatusClassName(1)).toContain("green");
    });

    it("regresa clase roja para rechazada", () => {
        expect(CalendarUtils.getVacationStatusClassName(2)).toContain("red");
    });

    it("regresa clase amarilla para pendiente o estado desconocido", () => {
        expect(CalendarUtils.getVacationStatusClassName(0)).toContain("yellow");
        expect(CalendarUtils.getVacationStatusClassName(999)).toContain("yellow");
    });
});
