import { describe, it, expect } from "vitest";
import {
    formatDate,
    getSafeText,
    getStatusClassName,
} from "../../utils/vacationRequests";

describe("vacationRequests utils", () => {
    describe("formatDate", () => {
        it("formatea fechas válidas en formato es-MX", () => {
            expect(formatDate("2026-05-15T00:00:00.000Z")).toBe("15/05/2026");
        });

        it("regresa guion cuando no hay fecha", () => {
            expect(formatDate(null)).toBe("-");
            expect(formatDate(undefined)).toBe("-");
            expect(formatDate("")).toBe("-");
        });

        it("regresa guion cuando la fecha es inválida", () => {
            expect(formatDate("fecha inválida")).toBe("-");
        });
    });

    describe("getSafeText", () => {
        it("regresa el texto limpio cuando existe", () => {
            expect(getSafeText("  Ana Pendiente  ")).toBe("Ana Pendiente");
        });

        it("regresa fallback cuando el valor es null, undefined o vacío", () => {
            expect(getSafeText(null)).toBe("-");
            expect(getSafeText(undefined)).toBe("-");
            expect(getSafeText("   ")).toBe("-");
        });

        it("permite fallback personalizado", () => {
            expect(getSafeText("", "Sin dato")).toBe("Sin dato");
        });
    });

    describe("getStatusClassName", () => {
        it("regresa clase verde para aprobada", () => {
            expect(getStatusClassName(1)).toContain("green");
        });

        it("regresa clase roja para rechazada", () => {
            expect(getStatusClassName(2)).toContain("red");
        });

        it("regresa clase amarilla para pendiente o estado desconocido", () => {
            expect(getStatusClassName(0)).toContain("yellow");
            expect(getStatusClassName(999)).toContain("yellow");
        });
    });
});
