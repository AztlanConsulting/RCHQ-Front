import { describe, expect, it } from "vitest";
import {
  addDaysToDateOnly,
  calculateDateRangeDays,
  calendarItemToDetail,
  eventApiToDetail,
  formatEventDate,
  formatEventDateOnly,
  formatEventDateRange,
  formatEventTime,
  normalizeDateOnly,
} from "../../utils/calendarEventDetail";

describe("calendarEventDetail", () => {
  it("normaliza strings ISO a fechas YYYY-MM-DD sin desfase por zona horaria", () => {
    expect(normalizeDateOnly("2026-05-15T00:00:00.000Z")).toBe(
      "2026-05-15",
    );
  });

  it("suma días sobre fechas de solo día para rangos all-day exclusivos", () => {
    expect(addDaysToDateOnly("2026-05-17", 1)).toBe("2026-05-18");
  });

  it("calcula los días totales de un rango válido incluyendo inicio y fin", () => {
    expect(calculateDateRangeDays("2026-05-15", "2026-05-17")).toBe(3);
  });

  it("calculateDateRangeDays regresa null cuando no puede calcular el rango", () => {
    expect(calculateDateRangeDays("", "")).toBeNull();
    expect(calculateDateRangeDays("2026-05-10", "2026-05-05")).toBeNull();
    expect(calculateDateRangeDays("fecha-invalida", "2026-05-05")).toBeNull();
  });

  it("calendarItemToDetail calcula totalDays para vacaciones cuando hay fechas válidas", () => {
    const result = calendarItemToDetail({
      focus: "vacaciones",
      vacationId: "vacation-1",
      employeeId: "emp-1",
      name: "Ana López",
      startDate: "2026-06-05",
      endDate: "2026-06-10",
      usedDays: 4,
      status: 1,
    });

    expect(result).toMatchObject({
      focus: "vacaciones",
      vacationId: "vacation-1",
      employeeId: "emp-1",
      startDate: "2026-06-05",
      endDate: "2026-06-10",
      totalDays: 6,
    });
  });

  it("calendarItemToDetail conserva totalDays existente cuando ya viene calculado", () => {
    const result = calendarItemToDetail({
      focus: "vacaciones",
      vacationId: "vacation-1",
      name: "Ana López",
      startDate: "2026-06-05",
      endDate: "2026-06-10",
      totalDays: 10,
    });

    expect(result.totalDays).toBe(10);
  });

  it("calendarItemToDetail usa null como totalDays cuando no puede calcularlo", () => {
    const result = calendarItemToDetail({
      focus: "vacaciones",
      vacationId: "vacation-1",
      name: "Ana López",
      startDate: "",
      endDate: "",
    });

    expect(result.totalDays).toBeNull();
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

  it("eventApiToDetail usa el rango original UTC aunque la fila de lista sea un segmento", () => {
    const result = eventApiToDetail({
      id: "segment-2",
      title: "Vacaciones de John Smith",
      start: new Date("2026-05-06T00:00:00"),
      end: new Date("2026-05-07T00:00:00"),
      allDay: true,
      extendedProps: {
        focus: "vacaciones",
        detailAllDay: false,
        utcStart: "2026-05-05T06:00:00.000Z",
        utcEnd: "2026-05-07T06:00:00.000Z",
        startDate: "2026-05-05",
        endDate: "2026-05-07",
        startReadableDate: "2026-05-05",
        endReadableDate: "2026-05-07",
      },
    });

    expect(result).toMatchObject({
      allDay: false,
      startDate: "2026-05-05",
      endDate: "2026-05-07",
      readableStart: "2026-05-05",
      readableEnd: "2026-05-07",
    });
    expect(result.start.toISOString()).toBe("2026-05-05T06:00:00.000Z");
    expect(result.end.toISOString()).toBe("2026-05-07T06:00:00.000Z");
  });

  it("formatEventTime formatea horas válidas", () => {
    expect(
      formatEventTime("2026-05-15T15:30:00.000Z", { timeZone: "UTC" }),
    ).toBe("3:30 p.m.");
  });

  it("formatEventTime conserva el minuto real del registro", () => {
    expect(
      formatEventTime("2026-05-06T06:00:00.000Z", {
        timeZone: "America/Matamoros",
      }),
    ).toBe("1:00 a.m.");
  });

  it("formatEventTime regresa guion si no hay valor", () => {
    expect(formatEventTime("")).toBe("—");
  });
});
