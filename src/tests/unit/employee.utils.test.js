import { describe, it, expect } from "vitest";
import Dates from "../../utils/helpers/dates.helpers";
import EmployeeUtils from "../../utils/employee.utils";

// ─── totalWorkDaysFromApprovedVacationRequests ────────────────────────────────
describe("totalWorkDaysFromApprovedVacationRequests", () => {
  it("retorna 0 para entradas no array", () => {
    expect(EmployeeUtils.totalWorkDaysFromApprovedVacationRequests(null)).toBe(0);
    expect(EmployeeUtils.totalWorkDaysFromApprovedVacationRequests(undefined)).toBe(0);
  });

  it("ignora solicitudes con status distinto de 1", () => {
    const sum = EmployeeUtils.totalWorkDaysFromApprovedVacationRequests([
      { status: 0, start: "2024-01-01T00:00:00.000Z", end: "2024-01-05T00:00:00.000Z" },
    ]);
    expect(sum).toBe(0);
  });

  it("suma días laborables (fallback Lun–Vie) sin employeeWorkdays", () => {
    const sum = EmployeeUtils.totalWorkDaysFromApprovedVacationRequests([
      { status: 1, start: "2024-01-01T00:00:00.000Z", end: "2024-01-02T00:00:00.000Z" },
      { status: 1, start: "2024-01-08T00:00:00.000Z", end: "2024-01-08T00:00:00.000Z" },
    ]);
    expect(sum).toBe(3);
  });

  it("usa los días del empleado cuando se proveen", () => {
    const workdays = [
      { name: "Lunes" },
      { name: "Martes" },
      { name: "Jueves" },
      { name: "Viernes" },
    ];
    const sum = EmployeeUtils.totalWorkDaysFromApprovedVacationRequests(
      [{ status: 1, start: "2024-01-01T00:00:00.000Z", end: "2024-01-05T00:00:00.000Z" }],
      workdays,
    );
    expect(sum).toBe(4);
  });

  it("ignora nombres de días desconocidos sin romper", () => {
    const workdays = [{ name: "Lunes" }, { name: "DiasDesconocido" }];
    const sum = EmployeeUtils.totalWorkDaysFromApprovedVacationRequests(
      [{ status: 1, start: "2024-01-01T00:00:00.000Z", end: "2024-01-01T00:00:00.000Z" }],
      workdays,
    );
    expect(sum).toBe(1);
  });
});

// ─── Dates.parseUTCDateToHours ────────────────────────────────────────────────
describe("Dates.parseUTCDateToHours", () => {
  it("retorna N/A para valores falsy", () => {
    expect(Dates.parseUTCDateToHours(null)).toBe("N/A");
    expect(Dates.parseUTCDateToHours(undefined)).toBe("N/A");
    expect(Dates.parseUTCDateToHours("")).toBe("N/A");
  });

  it("parsea horas UTC con padding", () => {
    expect(Dates.parseUTCDateToHours("1970-01-01T08:00:00.000Z")).toBe("08:00");
    expect(Dates.parseUTCDateToHours("1970-01-01T17:30:00.000Z")).toBe(
      "17:30",
    );
  });

  it("aplica padding a horas menores de 10", () => {
    expect(Dates.parseUTCDateToHours("1970-01-01T09:05:00.000Z")).toBe(
      "09:05",
    );
  });
});

// ─── countWorkdayDays ─────────────────────────────────────────────────────────
describe("countWorkdayDays", () => {
  it("retorna 0 para entradas no array", () => {
    expect(EmployeeUtils.countWorkdayDays(null)).toBe(0);
    expect(EmployeeUtils.countWorkdayDays(undefined)).toBe(0);
  });

  it("retorna la cantidad de días en el array", () => {
    expect(EmployeeUtils.countWorkdayDays([])).toBe(0);
    expect(EmployeeUtils.countWorkdayDays([{ name: "Lunes" }, { name: "Martes" }])).toBe(2);
  });
});

// ─── countWorkdaysHours ───────────────────────────────────────────────────────
describe("countWorkdaysHours", () => {
  it("retorna 0 para entradas no array", () => {
    expect(EmployeeUtils.countWorkdaysHours(null)).toBe(0);
    expect(EmployeeUtils.countWorkdaysHours(undefined)).toBe(0);
  });

  it("retorna 0 para workdays sin start o end", () => {
    expect(EmployeeUtils.countWorkdaysHours([{ name: "Lunes" }])).toBe(0);
  });

  it("retorna 0 para un array vacío", () => {
    expect(EmployeeUtils.countWorkdaysHours([])).toBe(0);
  });
});
