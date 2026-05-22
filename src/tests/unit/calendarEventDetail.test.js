import { describe, expect, it } from "vitest";
import {
  addDaysToDateOnly,
  formatEventDate,
  formatEventDateOnly,
  formatEventDateRange,
  formatEventTime,
  normalizeDateOnly,
} from "../../utils/calendarEventDetail";

describe("calendarEventDetail", () => {
  it("normaliza strings ISO a fechas YYYY-MM-DD sin desfase por zona horaria", () => {
    expect(normalizeDateOnly("2026-05-15T00:00:00.000Z")).toBe("2026-05-15");
  });

  it("suma días sobre fechas de solo día para rangos all-day exclusivos", () => {
    expect(addDaysToDateOnly("2026-05-17", 1)).toBe("2026-05-18");
  });

  it("formatea fechas de solo día sin moverlas al día anterior", () => {
    expect(formatEventDate("2026-05-15T00:00:00.000Z")).toBe(
      "15 de mayo de 2026",
    );
  });

  it("formatEventDateOnly formatea fechas en español", () => {
    expect(formatEventDateOnly("2026-05-15")).toBe("15 de mayo de 2026");
  });

  it("formatEventDateRange muestra un solo día cuando inicio y fin son iguales", () => {
    expect(formatEventDateRange("2026-05-15", "2026-05-15")).toBe(
      "15 de mayo de 2026",
    );
  });

  it("formatEventDateRange muestra rango cuando inicio y fin son distintos", () => {
    expect(formatEventDateRange("2026-05-15", "2026-05-17")).toBe(
      "15 de mayo de 2026 - 17 de mayo de 2026",
    );
  });

  it("formatEventDateRange resta un día al fin cuando endExclusive es true", () => {
    expect(
      formatEventDateRange("2026-05-15", "2026-05-18", {
        endExclusive: true,
      }),
    ).toBe("15 de mayo de 2026 - 17 de mayo de 2026");
  });

  it("formatEventDateRange regresa guion cuando no hay fechas válidas", () => {
    expect(formatEventDateRange("", "")).toBe("—");
  });

  it("formatEventTime formatea horas válidas", () => {
    expect(formatEventTime("2026-05-15T15:30:00.000Z")).toBe("3:30 p.m.");
  });

  it("formatEventTime regresa guion si no hay valor", () => {
    expect(formatEventTime("")).toBe("—");
  });
});
