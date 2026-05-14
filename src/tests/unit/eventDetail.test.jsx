import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import EventDetail from "../../components/molecules/calendarCards/eventDetail";

describe("EventDetail", () => {
  it("retorna null sin evento", () => {
    const { container } = render(<EventDetail event={null} />);
    expect(container.firstChild).toBeNull();
  });

  it("muestra título, focus y botones", () => {
    render(
      <EventDetail
        event={{
          title: "Curso",
          focusLabel: "Eventos",
          eventType: "taller",
          date: "2026-05-15T00:00:00.000Z",
          start: new Date("2026-05-15T14:00:00.000Z"),
          end: new Date("2026-05-15T16:00:00.000Z"),
          description: "Detalle\nlínea",
        }}
      />,
    );
    expect(screen.getByRole("heading", { name: "Curso" })).toBeInTheDocument();
    expect(screen.getByText("Eventos")).toBeInTheDocument();
    expect(screen.getByText("Taller")).toBeInTheDocument();
    expect(screen.getByText(/Detalle/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /eliminar/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /modificar/i })).toBeInTheDocument();
  });
});
