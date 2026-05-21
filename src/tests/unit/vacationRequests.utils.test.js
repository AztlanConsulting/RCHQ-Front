import { describe, it, expect } from "vitest";
import VacationUtils from "../../utils/vacation.utils";

describe("VacationUtils", () => {
    describe("formatDate", () => {
        it("formatea fechas válidas en formato es-MX", () => {
            expect(VacationUtils.formatDate("2026-05-15T00:00:00.000Z")).toBe("15/05/2026");
        });

        it("regresa guion cuando no hay fecha", () => {
            expect(VacationUtils.formatDate(null)).toBe("-");
            expect(VacationUtils.formatDate(undefined)).toBe("-");
            expect(VacationUtils.formatDate("")).toBe("-");
        });

        it("regresa guion cuando la fecha es inválida", () => {
            expect(VacationUtils.formatDate("fecha inválida")).toBe("-");
        });
    });

    describe("getSafeText", () => {
        it("regresa el texto limpio cuando existe", () => {
            expect(VacationUtils.getSafeText("  Ana Pendiente  ")).toBe("Ana Pendiente");
        });

        it("regresa fallback cuando el valor es null, undefined o vacío", () => {
            expect(VacationUtils.getSafeText(null)).toBe("-");
            expect(VacationUtils.getSafeText(undefined)).toBe("-");
            expect(VacationUtils.getSafeText("   ")).toBe("-");
        });

        it("permite fallback personalizado", () => {
            expect(VacationUtils.getSafeText("", "Sin dato")).toBe("Sin dato");
        });
    });

    describe("getStatusClassName", () => {
        it("regresa clase verde para aprobada", () => {
            expect(VacationUtils.getStatusClassName(1)).toContain("green");
        });

        it("regresa clase roja para rechazada", () => {
            expect(VacationUtils.getStatusClassName(2)).toContain("red");
        });

        it("regresa clase amarilla para pendiente o estado desconocido", () => {
            expect(VacationUtils.getStatusClassName(0)).toContain("yellow");
            expect(VacationUtils.getStatusClassName(999)).toContain("yellow");
        });
    });
});
