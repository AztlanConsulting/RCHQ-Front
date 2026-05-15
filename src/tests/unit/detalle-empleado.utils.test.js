import { describe, it, expect } from "vitest";
import {
    totalWorkDaysFromApprovedVacationRequests,
    parseUTCDateToHours,
    countWorkdayDays,
    countWorkdaysHours,
} from "../../utils/detalle-empleado.utils";

// ─── totalWorkDaysFromApprovedVacationRequests ────────────────────────────────
describe("totalWorkDaysFromApprovedVacationRequests", () => {
    it("retorna 0 para entradas no array", () => {
        expect(totalWorkDaysFromApprovedVacationRequests(null)).toBe(0);
        expect(totalWorkDaysFromApprovedVacationRequests(undefined)).toBe(0);
    });

    it("ignora solicitudes con status distinto de 1", () => {
        const sum = totalWorkDaysFromApprovedVacationRequests([
            {
                status: 0,
                start: "2024-01-01T00:00:00.000Z",
                end: "2024-01-05T00:00:00.000Z",
            },
        ]);
        expect(sum).toBe(0);
    });

    it("suma días laborables (fallback Lun–Vie) sin employeeWorkdays", () => {
        // 2024-01-01 (lun) – 2024-01-02 (mar) = 2; 2024-01-08 (lun) = 1 → 3
        const sum = totalWorkDaysFromApprovedVacationRequests([
            {
                status: 1,
                start: "2024-01-01T00:00:00.000Z",
                end: "2024-01-02T00:00:00.000Z",
            },
            {
                status: 1,
                start: "2024-01-08T00:00:00.000Z",
                end: "2024-01-08T00:00:00.000Z",
            },
        ]);
        expect(sum).toBe(3);
    });

    it("usa los días del empleado cuando se proveen", () => {
        // 2024-01-01 (lun) – 2024-01-05 (vie) = 5 días Lun–Vie
        // pero el empleado solo trabaja Lun, Mar, Jue, Vie (sin Miércoles) → 4
        const workdays = [
            { name: "Lunes" },
            { name: "Martes" },
            { name: "Jueves" },
            { name: "Viernes" },
        ];
        const sum = totalWorkDaysFromApprovedVacationRequests(
            [
                {
                    status: 1,
                    start: "2024-01-01T00:00:00.000Z",
                    end: "2024-01-05T00:00:00.000Z",
                },
            ],
            workdays,
        );
        expect(sum).toBe(4);
    });

    it("ignora nombres de días desconocidos sin romper", () => {
        const workdays = [{ name: "Lunes" }, { name: "DiasDesconocido" }];
        const sum = totalWorkDaysFromApprovedVacationRequests(
            [
                {
                    status: 1,
                    start: "2024-01-01T00:00:00.000Z",
                    end: "2024-01-01T00:00:00.000Z",
                },
            ],
            workdays,
        );
        expect(sum).toBe(1);
    });
});

// ─── parseUTCDateToHours ──────────────────────────────────────────────────────
describe("parseUTCDateToHours", () => {
    it("retorna N/A para valores falsy", () => {
        expect(parseUTCDateToHours(null)).toBe("N/A");
        expect(parseUTCDateToHours(undefined)).toBe("N/A");
        expect(parseUTCDateToHours("")).toBe("N/A");
    });

    it("parsea horas UTC con padding", () => {
        expect(parseUTCDateToHours("1970-01-01T08:00:00.000Z")).toBe("08:00");
        expect(parseUTCDateToHours("1970-01-01T17:30:00.000Z")).toBe("17:30");
    });

    it("aplica padding a horas menores de 10", () => {
        expect(parseUTCDateToHours("1970-01-01T09:05:00.000Z")).toBe("09:05");
    });
});

// ─── countWorkdayDays ─────────────────────────────────────────────────────────
describe("countWorkdayDays", () => {
    it("retorna 0 para entradas no array", () => {
        expect(countWorkdayDays(null)).toBe(0);
        expect(countWorkdayDays(undefined)).toBe(0);
    });

    it("retorna la cantidad de días en el array", () => {
        expect(countWorkdayDays([])).toBe(0);
        expect(countWorkdayDays([{ name: "Lunes" }, { name: "Martes" }])).toBe(
            2,
        );
    });
});

// ─── countWorkdaysHours ───────────────────────────────────────────────────────
describe("countWorkdaysHours", () => {
    it("retorna 0 para entradas no array", () => {
        expect(countWorkdaysHours(null)).toBe(0);
        expect(countWorkdaysHours(undefined)).toBe(0);
    });

    it("retorna 0 para workdays sin start o end", () => {
        expect(countWorkdaysHours([{ name: "Lunes" }])).toBe(0);
    });

    it("retorna 0 para un array vacío", () => {
        expect(countWorkdaysHours([])).toBe(0);
    });
});
