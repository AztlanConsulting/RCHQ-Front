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
});
