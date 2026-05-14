import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useBaseCalendar } from "../../hooks/organism/useBaseCalendar";

vi.mock("../../services/calendarService", () => ({
  getEmployeeHouseName: vi.fn(),
  getEventsInRange: vi.fn(),
  getOwnEmployeeId: vi.fn(),
}));

import {
  getEmployeeHouseName,
  getEventsInRange,
  getOwnEmployeeId,
} from "../../services/calendarService";

const makeCalendarRef = () => {
  const changeView = vi.fn();
  const renderCal = vi.fn();
  return {
    ref: { current: { getApi: () => ({ changeView, render: renderCal }) } },
    changeView,
    renderCal,
  };
};

const stubFcButtons = () => {
  const btn = { classList: { remove: vi.fn(), add: vi.fn() } };
  vi.spyOn(document, "querySelectorAll").mockReturnValue({
    forEach: (fn) => fn(btn),
  });
  vi.spyOn(document, "querySelector").mockReturnValue(btn);
  return btn;
};

beforeEach(() => {
  vi.clearAllMocks();
  stubFcButtons();
  getOwnEmployeeId.mockReturnValue("emp-1");
  getEmployeeHouseName.mockResolvedValue("Casa Beta");
  getEventsInRange.mockResolvedValue([]);
});

describe("useBaseCalendar", () => {
  it("generateTitle en vista mes usa mes completo y año", () => {
    const { result } = renderHook(() => useBaseCalendar());
    const title = result.current.generateTitle({
      date: { array: [2026, 4, 1] },
    });
    expect(title).toContain("2026");
    expect(title.toLowerCase()).toMatch(/mayo/);
  });

  it("handleDatesSet no llama API dos veces para el mismo rango", async () => {
    const { result } = renderHook(() => useBaseCalendar());
    await act(async () => {
      result.current.handleDatesSet({
        startStr: "2026-05-01T00:00:00",
        endStr: "2026-05-31T00:00:00",
      });
    });
    await act(async () => {
      result.current.handleDatesSet({
        startStr: "2026-05-01T00:00:00",
        endStr: "2026-05-31T00:00:00",
      });
    });
    expect(getEventsInRange).not.toHaveBeenCalled();
  });

  it("setOwnCalendar y handleDatesSet disparan getEventsInRange una vez por rango", async () => {
    const { result } = renderHook(() => useBaseCalendar());
    await act(async () => {
      await result.current.setOwnCalendar();
    });
    getEventsInRange.mockClear();

    await act(async () => {
      result.current.handleDatesSet({
        startStr: "2026-05-01T00:00:00",
        endStr: "2026-06-01T00:00:00",
      });
    });
    expect(getEventsInRange).toHaveBeenCalledWith(
      "emp-1",
      "2026-05-01",
      "2026-06-01",
    );

    await act(async () => {
      result.current.handleDatesSet({
        startStr: "2026-05-01T00:00:00",
        endStr: "2026-06-01T00:00:00",
      });
    });
    expect(getEventsInRange).toHaveBeenCalledTimes(1);
  });

  it("toggleList llama changeView con vista lista mes", async () => {
    const { ref, changeView } = makeCalendarRef();
    const { result } = renderHook(() => useBaseCalendar());
    await act(async () => {
      result.current.toggleList(ref);
    });
    expect(changeView).toHaveBeenCalledWith("listMonth");
  });

  it("refetch: si first datesSet sin id, al setear empleado usa getEventsInRange", async () => {
    const { result } = renderHook(() => useBaseCalendar());
    await act(async () => {
      result.current.handleDatesSet({
        startStr: "2026-05-01T00:00:00",
        endStr: "2026-06-01T00:00:00",
      });
    });
    expect(getEventsInRange).not.toHaveBeenCalled();
    getEventsInRange.mockClear();

    await act(async () => {
      await result.current.setOwnCalendar();
    });

    await waitFor(() => {
      expect(getEventsInRange).toHaveBeenCalledWith(
        "emp-1",
        "2026-05-01",
        "2026-06-01",
      );
    });
  });
});
