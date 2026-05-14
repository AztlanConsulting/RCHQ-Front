import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import DayGridCard from "../../components/molecules/calendarCards/dayGridCard";
import DayGridOverflowCard from "../../components/molecules/calendarCards/dayGridOverflowCard";
import WeekTimeCard from "../../components/molecules/calendarCards/weekTimeCard";
import DayTimeCard from "../../components/molecules/calendarCards/dayTimeCard";

vi.mock("@/utils/dates", () => ({
  getStartHour: vi.fn((d) => (d ? "09:30" : "")),
}));

import { getStartHour } from "@/utils/dates";

describe("DayGridOverflowCard", () => {
  it("null si count inválido", () => {
    const { container } = render(<DayGridOverflowCard count={0} />);
    expect(container.firstChild).toBeNull();
  });

  it("muestra +N más", () => {
    render(<DayGridOverflowCard count={3} />);
    expect(screen.getByText("+3 más")).toBeInTheDocument();
  });
});

describe("DayGridCard", () => {
  it("muestra título y hora no todo el día", () => {
    const arg = {
      event: {
        title: "A",
        allDay: false,
        start: new Date(),
        backgroundColor: "#eee",
        borderColor: "#111",
      },
    };
    render(<DayGridCard arg={arg} />);
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("09:30")).toBeInTheDocument();
  });

  it("todo el día muestra Día", () => {
    getStartHour.mockReturnValueOnce("00:00");
    const arg = {
      event: {
        title: "B",
        allDay: false,
        start: new Date(),
        backgroundColor: "#eee",
      },
    };
    render(<DayGridCard arg={arg} />);
    expect(screen.getByText("Día")).toBeInTheDocument();
  });
});

describe("WeekTimeCard", () => {
  it("usa timeText si viene en arg", () => {
    const arg = {
      timeText: "10:00 – 11:00",
      event: {
        title: "W",
        allDay: false,
        start: new Date(),
        end: new Date(),
        extendedProps: {},
      },
    };
    render(<WeekTimeCard arg={arg} />);
    expect(screen.getByText("10:00 – 11:00")).toBeInTheDocument();
  });

  it("todo el día", () => {
    const arg = {
      event: {
        title: "W",
        allDay: true,
        extendedProps: {},
      },
    };
    render(<WeekTimeCard arg={arg} />);
    expect(screen.getByText("Todo el Día")).toBeInTheDocument();
  });
});

describe("DayTimeCard", () => {
  it("muestra timeText", () => {
    render(
      <DayTimeCard
        arg={{
          timeText: "8:00 - 9:00",
          event: { title: "D" },
        }}
      />,
    );
    expect(screen.getByText("D")).toBeInTheDocument();
    expect(screen.getByText("8:00 - 9:00")).toBeInTheDocument();
  });
});
