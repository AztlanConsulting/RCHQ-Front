import { describe, it, expect } from "vitest";
import {
  FOCUS_OPTIONS,
  SCOPE_OPTIONS,
  getFocusOption,
  getScopeOption,
  eventApiToDetail,
} from "../../utils/calendar.utils";

describe("getFocusOption", () => {
  it("encuentra la opción por event.focus", () => {
    expect(getFocusOption({ focus: "eventos" })).toEqual(
      FOCUS_OPTIONS.find((o) => o.value === "eventos"),
    );
  });

  it("retorna undefined si no coincide", () => {
    expect(getFocusOption({ focus: "unknown" })).toBeUndefined();
  });
});

describe("getScopeOption", () => {
  it("encuentra la opción por event.scope", () => {
    expect(getScopeOption({ scope: "personal" })).toEqual(
      SCOPE_OPTIONS.find((o) => o.value === "personal"),
    );
  });

  it("retorna undefined si no coincide", () => {
    expect(getScopeOption({ scope: "x" })).toBeUndefined();
  });
});

describe("eventApiToDetail", () => {
  it("retorna null si no hay evento", () => {
    expect(eventApiToDetail(null)).toBeNull();
    expect(eventApiToDetail(undefined)).toBeNull();
  });

  it("mapea extendedProps y fechas Date con toISOString", () => {
    const start = new Date("2026-05-01T12:00:00.000Z");
    const end = new Date("2026-05-01T14:00:00.000Z");
    const ev = {
      id: "42",
      title: "Reunión",
      start,
      end,
      allDay: false,
      backgroundColor: "#eee",
      borderColor: "#333",
      extendedProps: {
        subtitle: "Sub",
        description: "Desc",
        focus: "eventos",
        focusLabel: "Eventos",
        scope: "house",
        scopeLabel: "De Casa",
        eventType: "meet",
        date: "2026-05-01",
        icon: "employee",
        status: 1,
      },
    };
    const d = eventApiToDetail(ev);
    expect(d).toMatchObject({
      id: "42",
      title: "Reunión",
      start,
      end,
      startStr: start.toISOString(),
      endStr: end.toISOString(),
      allDay: false,
      subtitle: "Sub",
      description: "Desc",
      focus: "eventos",
      focusLabel: "Eventos",
      scope: "house",
      eventType: "meet",
      date: "2026-05-01",
      icon: "employee",
      status: 1,
    });
  });

  it("tolera extendedProps vacío y start/end ausentes", () => {
    const d = eventApiToDetail({
      id: "1",
      title: "Sin hora",
      extendedProps: {},
    });
    expect(d.subtitle).toBeUndefined();
    expect(d.startStr).toBe("");
    expect(d.endStr).toBe("");
  });
});
