import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useCalendarFilters } from "../../hooks/organism/useCalendarFilters";

vi.mock("../../services/calendarService", () => ({
  getEventsTypes: vi.fn(),
}));

import { getEventsTypes } from "../../services/calendarService";

const rawEvent = (overrides = {}) => ({
  name: "E1",
  start: "2026-05-01",
  end: "2026-05-02",
  color: "#fff",
  lastsAllDay: true,
  focus: "eventos",
  scope: "global",
  type: "meetup",
  ...overrides,
});

beforeEach(() => {
  vi.clearAllMocks();
  getEventsTypes.mockResolvedValue([{ name: "Meetup" }]);
});

describe("useCalendarFilters", () => {
  it("tras resolver tipos, filtra por scope", async () => {
    const { result } = renderHook(() =>
      useCalendarFilters([
        rawEvent({ scope: "global" }),
        rawEvent({ scope: "house", name: "H" }),
      ]),
    );

    await waitFor(() =>
      expect(result.current.eventTypeOptions.length).toBeGreaterThan(0),
    );

    expect(result.current.visibleEvents).toHaveLength(2);

    act(() => {
      result.current.setScopeFilters(["house"]);
    });

    await waitFor(() => expect(result.current.visibleEvents).toHaveLength(1));
    expect(result.current.visibleEvents[0].title).toBe("H");
  });

  it("showEventFilters depende de si focus incluye eventos", async () => {
    const { result } = renderHook(() => useCalendarFilters([]));

    await waitFor(() => expect(getEventsTypes).toHaveBeenCalled());

    expect(result.current.showEventFilters).toBe(true);
    act(() => {
      result.current.setFocusFilters(["vacaciones"]);
    });
    expect(result.current.showEventFilters).toBe(false);
    expect(result.current.showVacationFilters).toBe(true);
  });

  it("getEventsTypes rechazado no rompe el hook", async () => {
    getEventsTypes.mockRejectedValueOnce(new Error("network"));
    const { result } = renderHook(() => useCalendarFilters([rawEvent()]));
    await waitFor(() => expect(getEventsTypes).toHaveBeenCalled());
    expect(result.current.eventTypeOptions).toEqual([]);
  });
});
