import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import BaseCalendar from "../../components/organism/baseCalendar";

let capturedProps;

vi.mock("@fullcalendar/react", () => ({
  default: (props) => {
    capturedProps = props;
    return (
      <div data-testid="full-calendar">
        <button onClick={props.customButtons.toggleListButton.click}>Lista</button>
        <button onClick={props.customButtons.monthButton.click}>Mes</button>
        <button onClick={props.customButtons.weekButton.click}>Semana</button>
        <button onClick={props.customButtons.dayButton.click}>Día</button>
        <button onClick={() => props.eventClick?.({ event: { id: "evt-1" } })}>Abrir evento</button>
      </div>
    );
  },
}));

vi.mock("@fullcalendar/daygrid", () => ({ default: {} }));
vi.mock("@fullcalendar/timegrid", () => ({ default: {} }));
vi.mock("@fullcalendar/list", () => ({ default: {} }));
vi.mock("@fullcalendar/interaction", () => ({ default: {} }));
vi.mock("@fullcalendar/core/locales/es", () => ({ default: {} }));

vi.mock("../../components/molecules/calendarCards/dayGridCard", () => ({ default: () => <div>DayGridCard</div> }));
vi.mock("../../components/molecules/calendarCards/dayGridOverflowCard", () => ({ default: () => <div>Overflow</div> }));
vi.mock("../../components/molecules/calendarCards/weekTimeCard", () => ({ default: () => <div>WeekTimeCard</div> }));
vi.mock("../../components/molecules/calendarCards/dayTimeCard", () => ({ default: () => <div>DayTimeCard</div> }));
vi.mock("../../components/molecules/calendarCards/listEventCard", () => ({ default: () => <div>ListEventCard</div> }));

describe("BaseCalendar", () => {
  const calendarRef = { current: { getApi: vi.fn() } };
  const defaultProps = {
    loadButtonsAtStart: vi.fn(),
    calendarRef,
    toggleList: vi.fn(),
    setMonthView: vi.fn(),
    setWeekView: vi.fn(),
    setDayView: vi.fn(),
    generateTitle: vi.fn(() => "Mayo 2026"),
    getWeekDayName: vi.fn(() => "Lunes"),
    resizeHandler: vi.fn(),
    visibleEvents: [{ id: "1", title: "Evento" }],
    handleDatesSet: vi.fn(),
    onEventClick: vi.fn(),
  };

  beforeEach(() => {
    capturedProps = undefined;
    vi.clearAllMocks();
  });

  it("carga botones al inicio y ajusta resize al montar", () => {
    render(<BaseCalendar {...defaultProps} />);

    expect(defaultProps.loadButtonsAtStart).toHaveBeenCalledTimes(1);
    expect(defaultProps.resizeHandler).toHaveBeenCalledWith(calendarRef);
  });

  it("conecta los botones personalizados con los handlers del calendario", () => {
    render(<BaseCalendar {...defaultProps} />);

    fireEvent.click(screen.getByRole("button", { name: "Lista" }));
    fireEvent.click(screen.getByRole("button", { name: "Mes" }));
    fireEvent.click(screen.getByRole("button", { name: "Semana" }));
    fireEvent.click(screen.getByRole("button", { name: "Día" }));

    expect(defaultProps.toggleList).toHaveBeenCalledWith(calendarRef);
    expect(defaultProps.setMonthView).toHaveBeenCalledWith(calendarRef);
    expect(defaultProps.setWeekView).toHaveBeenCalledWith(calendarRef);
    expect(defaultProps.setDayView).toHaveBeenCalledWith(calendarRef);
  });

  it("pasa los eventos visibles a FullCalendar y reenvía eventClick", () => {
    render(<BaseCalendar {...defaultProps} />);

    expect(capturedProps.events).toEqual(defaultProps.visibleEvents);

    fireEvent.click(screen.getByRole("button", { name: /abrir evento/i }));

    expect(defaultProps.onEventClick).toHaveBeenCalledWith({ event: { id: "evt-1" } });
  });
});
