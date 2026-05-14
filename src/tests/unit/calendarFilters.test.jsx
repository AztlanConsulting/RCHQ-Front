import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import CalendarFilters from "../../components/molecules/calendarFilters";

const noop = () => {};

const baseProps = () => ({
  houseName: "",
  focusFilters: ["eventos"],
  setFocusFilters: noop,
  focusOptions: [{ value: "eventos", label: "Eventos", icon: "employee" }],
  scopeFilters: ["global"],
  setScopeFilters: noop,
  scopeOptions: [{ value: "global", label: "Global", color: "#000" }],
  eventTypeFilters: ["meet"],
  setEventTypeFilters: noop,
  eventTypeOptions: [{ value: "meet", label: "Meet" }],
  showEventFilters: true,
  showVacationFilters: false,
  showAbscenceFilters: false,
});

describe("CalendarFilters", () => {
  it("muestra título y subsección de eventos", () => {
    render(<CalendarFilters {...baseProps()} />);
    expect(screen.getByRole("heading", { name: "Calendario" })).toBeInTheDocument();
    expect(screen.getByText("VISIBILIDAD")).toBeInTheDocument();
  });

  it("muestra houseName cuando existe", () => {
    render(<CalendarFilters {...baseProps()} houseName="Casa Norte" />);
    expect(screen.getByRole("heading", { name: "Casa Norte" })).toBeInTheDocument();
  });

  it("oculta filtros de eventos cuando showEventFilters es false", () => {
    render(<CalendarFilters {...baseProps()} showEventFilters={false} />);
    expect(screen.queryByText("VISIBILIDAD")).not.toBeInTheDocument();
  });

  it("muestra vacaciones y ausencias según flags", () => {
    render(
      <CalendarFilters
        {...baseProps()}
        showEventFilters={false}
        showVacationFilters
        showAbscenceFilters
      />,
    );
    expect(screen.getByText("VACACIONES")).toBeInTheDocument();
    expect(screen.getByText("AUSENCIAS")).toBeInTheDocument();
  });
});
