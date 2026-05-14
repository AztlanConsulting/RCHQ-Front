import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Calendario from "../../pages/calendario";

vi.mock("../../hooks/organism/useBaseCalendar", () => ({
  useBaseCalendar: vi.fn(),
}));

vi.mock("../../hooks/organism/useCalendarFilters", () => ({
  useCalendarFilters: vi.fn(),
}));

vi.mock("../../components/organism/baseCalendar", () => ({
  default: function MockBaseCalendar({ onEventClick, visibleEvents }) {
    return (
      <div>
        <span data-testid="n-events">{visibleEvents?.length ?? 0}</span>
        <button
          type="button"
          onClick={() =>
            onEventClick?.({
              event: {
                id: "1",
                title: "Click me",
                start: new Date("2026-05-10T15:00:00.000Z"),
                end: new Date("2026-05-10T16:00:00.000Z"),
                allDay: false,
                extendedProps: {
                  subtitle: "Sub",
                  focusLabel: "Eventos",
                  eventType: "meet",
                  date: "2026-05-10",
                  icon: "employee",
                },
              },
            })
          }
        >
          open-event
        </button>
      </div>
    );
  },
}));

import { useBaseCalendar } from "../../hooks/organism/useBaseCalendar";
import { useCalendarFilters } from "../../hooks/organism/useCalendarFilters";

const baseCalendarReturn = () => ({
  employeeHouseName: "Casa Norte",
  allEvents: [],
  handleDatesSet: vi.fn(),
  loadButtonsAtStart: vi.fn(),
  toggleList: vi.fn(),
  setMonthView: vi.fn(),
  setWeekView: vi.fn(),
  setDayView: vi.fn(),
  generateTitle: vi.fn(),
  getWeekDayName: vi.fn(),
  resizeHandler: vi.fn(),
  setOwnCalendar: vi.fn(),
});

const filterReturn = () => ({
  focusFilters: ["eventos"],
  setFocusFilters: vi.fn(),
  focusOptions: [],
  scopeFilters: [],
  setScopeFilters: vi.fn(),
  scopeOptions: [],
  eventTypeFilters: [],
  setEventTypeFilters: vi.fn(),
  eventTypeOptions: [],
  showEventFilters: true,
  showVacationFilters: false,
  showAbscenceFilters: false,
  visibleEvents: [{ id: "0", title: "Shown" }],
});

describe("Integración: Calendario", () => {
  let setOwnCalendar;

  beforeEach(() => {
    vi.clearAllMocks();
    setOwnCalendar = vi.fn();
    useBaseCalendar.mockReturnValue({
      ...baseCalendarReturn(),
      setOwnCalendar,
    });
    useCalendarFilters.mockReturnValue(filterReturn());
  });

  it("monta filtros, calendario stub y llama setOwnCalendar al iniciar", () => {
    render(<Calendario />);
    expect(screen.getByRole("heading", { name: "Calendario" })).toBeInTheDocument();
    expect(screen.getByText("Casa Norte")).toBeInTheDocument();
    expect(setOwnCalendar).toHaveBeenCalled();
  });

  it("abre el modal con detalle al hacer clic en evento simulado", async () => {
    const user = userEvent.setup();
    render(<Calendario />);
    await user.click(screen.getByRole("button", { name: "open-event" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Click me" })).toBeInTheDocument();
  });

  it("muestra recuento de eventos visibles del hook", () => {
    render(<Calendario />);
    expect(screen.getByTestId("n-events")).toHaveTextContent("1");
  });

  it("cierra el modal con el botón cerrar", async () => {
    const user = userEvent.setup();
    render(<Calendario />);
    await user.click(screen.getByRole("button", { name: "open-event" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /close modal/i }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
