import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import React from "react";
import BaseCalendar from "../../components/organism/baseCalendar";

let lastFullCalendarProps;

const FullCalendarStub = React.forwardRef((props, ref) => {
  lastFullCalendarProps = props;
  React.useImperativeHandle(ref, () => ({
    getApi: () => ({ render: vi.fn(), changeView: vi.fn() }),
  }));
  return (
    <div data-testid="fc-mock">
      <span data-testid="events-len">{props.events?.length ?? 0}</span>
    </div>
  );
});

vi.mock("@fullcalendar/react", () => ({
  default: FullCalendarStub,
}));

vi.mock("@fullcalendar/daygrid", () => ({}));
vi.mock("@fullcalendar/timegrid", () => ({}));
vi.mock("@fullcalendar/list", () => ({}));
vi.mock("@fullcalendar/interaction", () => ({}));
vi.mock("@fullcalendar/core/locales/es", () => ({}));

describe("BaseCalendar", () => {
  const calendarRef = React.createRef();
  const props = {
    loadButtonsAtStart: vi.fn(),
    calendarRef,
    toggleList: vi.fn(),
    setMonthView: vi.fn(),
    setWeekView: vi.fn(),
    setDayView: vi.fn(),
    generateTitle: vi.fn(() => "T"),
    getWeekDayName: vi.fn(() => "Lun"),
    resizeHandler: vi.fn(),
    visibleEvents: [{ id: "0", title: "E" }],
    handleDatesSet: vi.fn(),
    onEventClick: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    lastFullCalendarProps = undefined;
  });

  it("pasa visibleEvents y eventClick a FullCalendar", () => {
    render(<BaseCalendar {...props} />);
    expect(lastFullCalendarProps).toBeDefined();
    expect(lastFullCalendarProps.events).toEqual(props.visibleEvents);
    expect(lastFullCalendarProps.eventClick).toBeDefined();
    expect(typeof lastFullCalendarProps.datesSet).toBe("function");
  });

  it("loadButtonsAtStart y resizeHandler se invocan al montar", () => {
    render(<BaseCalendar {...props} />);
    expect(props.loadButtonsAtStart).toHaveBeenCalled();
    expect(props.resizeHandler).toHaveBeenCalledWith(calendarRef);
  });
});
