import { describe, expect, it } from "vitest";
import Dates from "../../utils/helpers/dates.helpers";

describe("Dates (calendar date-only helpers)", () => {
  it("normaliza strings ISO a fechas YYYY-MM-DD sin desfase por zona horaria", () => {
    expect(Dates.normalizeDateOnly("2026-05-15T00:00:00.000Z")).toBe("2026-05-15");
  });

  it("suma días sobre fechas de solo día para rangos all-day exclusivos", () => {
    expect(Dates.addDaysToDateOnly("2026-05-17", 1)).toBe("2026-05-18");
  });

  it("formatea fechas de solo día sin moverlas al día anterior", () => {
    expect(Dates.formatEventDate("2026-05-15T00:00:00.000Z")).toBe(
      "15 de mayo de 2026",
    );
  });

  it("formatEventUTCOnlyLong formatea fechas en español", () => {
    expect(Dates.formatEventUTCOnlyLong("2026-05-15")).toBe("15 de mayo de 2026");
  });

  it("formatEventDateRange muestra un solo día cuando inicio y fin son iguales", () => {
    expect(Dates.formatEventDateRange("2026-05-15", "2026-05-15")).toBe(
      "15 de mayo de 2026",
    );
  });

  it("formatEventDateRange muestra rango cuando inicio y fin son distintos", () => {
    expect(Dates.formatEventDateRange("2026-05-15", "2026-05-17")).toBe(
      "15 de mayo de 2026 - 17 de mayo de 2026",
    );
  });

  it("formatEventDateRange resta un día al fin cuando endExclusive es true", () => {
    expect(
      Dates.formatEventDateRange("2026-05-15", "2026-05-18", {
        endExclusive: true,
      }),
    ).toBe("15 de mayo de 2026 - 17 de mayo de 2026");
  });

  it("formatEventDateRange regresa guion cuando no hay fechas válidas", () => {
    expect(Dates.formatEventDateRange("", "")).toBe("—");
  });

  it("formatEventTime regresa guion si no hay valor", () => {
    expect(Dates.formatEventTime("")).toBe("—");
  });
});
