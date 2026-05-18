import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Calendario from "../../pages/calendario";
import { useBaseCalendar } from "../../hooks/organism/useBaseCalendar";
import {
  getAbsenceTypes,
  getEventsTypes,
  getHouseEmployees,
  updateAbsenceService,
} from "../../services/calendarService";

vi.mock("../../hooks/organism/useBaseCalendar", () => ({
  useBaseCalendar: vi.fn(),
}));

vi.mock("../../services/calendarService", () => ({
  getAbsenceTypes: vi.fn(),
  getEventsTypes: vi.fn(),
  getHouseEmployees: vi.fn(),
  updateAbsenceService: vi.fn(),
  getCalendarViewerRole: vi.fn(),
  buildAbsenceEvidenceUrl: vi.fn((link) => link),
}));

vi.mock("../../components/organism/baseCalendar", () => ({
  default: ({ visibleEvents = [], onEventClick }) => (
    <div data-testid="worker-calendar">
      <span>Eventos visibles: {visibleEvents.length}</span>
      {visibleEvents.map((event, index) => {
        const stableId =
          event.extendedProps?.absenceId ?? event.id ?? event.title ?? index;

        return (
          <button
            key={`${stableId}-${index}`}
            type="button"
            data-testid={`calendar-event-${stableId}`}
            onClick={() => onEventClick?.({ event })}
          >
            {event.title || `Evento ${index + 1}`}
          </button>
        );
      })}
    </div>
  ),
}));

const buildAbsence = (overrides = {}) => ({
  focus: "ausencias",
  absenceId: "absence-main",
  absenceTypeId: "type-medica",
  employeeId: "worker-1",
  name: "Laura Mendoza",
  type: "Médica",
  description: "Reposo indicado por médico",
  start: "2026-05-05T00:00:00.000Z",
  end: "2026-05-10T00:00:00.000Z",
  startDate: "2026-05-05",
  endDate: "2026-05-09",
  lastsAllDay: true,
  link: "",
  isDeleted: false,
  usedDays: 3,
  ...overrides,
});

const buildGlobalEvent = (overrides = {}) => ({
  focus: "eventos",
  scope: "global",
  name: "Evento global con URL",
  type: "General",
  description: "Este evento no debe tratarse como evidencia",
  start: "2026-05-06T09:00:00.000Z",
  end: "2026-05-06T10:00:00.000Z",
  lastsAllDay: false,
  color: "#C524FF",
  link: "http://localhost:3000/uploads/no-debe-abrirse.pdf",
  ...overrides,
});

const setWorkerCalendar = ({
  allEvents,
  viewerRole = "Mantenimiento",
  houseName = "Desarrollo",
} = {}) => {
  useBaseCalendar.mockReturnValue({
    employeeHouseName: houseName,
    allEvents,
    isList: false,
    handleDatesSet: vi.fn(),
    loadButtonsAtStart: vi.fn(),
    viewerRole,
    toggleList: vi.fn(),
    setMonthView: vi.fn(),
    setWeekView: vi.fn(),
    setDayView: vi.fn(),
    generateTitle: vi.fn(() => "Mayo 2026"),
    getWeekDayName: vi.fn(() => "Lunes"),
    resizeHandler: vi.fn(),
    setOwnCalendar: vi.fn(),
    reloadCurrentRange: vi.fn(),
  });
};

describe("Integración: trabajador consulta sus ausencias", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getEventsTypes.mockResolvedValue([{ name: "General" }]);
    getAbsenceTypes.mockResolvedValue([
      { absenceTypeId: "type-medica", name: "Médica" },
      { absenceTypeId: "type-paternidad", name: "Paternidad" },
    ]);
    getHouseEmployees.mockResolvedValue([
      { employeeId: "other-worker", name: "Otro trabajador" },
    ]);
    updateAbsenceService.mockResolvedValue({});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("abre el detalle de una ausencia propia con evidencia sin mostrar controles administrativos", async () => {
    const evidenceUrl = "http://localhost:3000/uploads/laura-evidencia.pdf";
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);

    setWorkerCalendar({
      viewerRole: "Psicóloga",
      allEvents: [
        buildAbsence({
          absenceId: "absence-with-evidence",
          link: evidenceUrl,
        }),
      ],
    });

    render(<Calendario />);

    const absenceButton = await screen.findByTestId(
      "calendar-event-absence-with-evidence",
    );
    fireEvent.click(absenceButton);

    const dialog = await screen.findByRole("dialog");

    expect(getHouseEmployees).not.toHaveBeenCalled();
    expect(screen.queryByText("TRABAJADOR")).not.toBeInTheDocument();
    expect(within(dialog).getByText("Ausencia")).toBeInTheDocument();
    expect(within(dialog).getByText("Tipo de ausencia:")).toBeInTheDocument();
    expect(within(dialog).getByText("Médica")).toBeInTheDocument();
    expect(within(dialog).getByText("Reposo indicado por médico")).toBeInTheDocument();
    expect(within(dialog).queryByText("Nombre del trabajador")).not.toBeInTheDocument();
    expect(within(dialog).queryByText("CURP")).not.toBeInTheDocument();
    expect(within(dialog).queryByRole("button", { name: /editar/i })).not.toBeInTheDocument();
    expect(within(dialog).queryByRole("button", { name: /eliminar/i })).not.toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole("button", { name: /ver evidencia/i }));

    expect(openSpy).toHaveBeenCalledWith(
      evidenceUrl,
      "_blank",
      "noopener,noreferrer",
    );
  });

  it("no se rompe con ausencia sin evidencia, campos vacíos y fechas raras", async () => {
    setWorkerCalendar({
      viewerRole: "Trabajador Social",
      allEvents: [
        buildAbsence({
          absenceId: "absence-weird-empty",
          name: "",
          type: "",
          description: "",
          startDate: "fecha-imposible",
          endDate: "",
          link: "",
          usedDays: 0,
        }),
      ],
    });

    render(<Calendario />);

    fireEvent.click(await screen.findByTestId("calendar-event-absence-weird-empty"));

    const dialog = await screen.findByRole("dialog");

    expect(within(dialog).getByText("Ausencia")).toBeInTheDocument();
    expect(within(dialog).getByText("Sin evidencia")).toBeInTheDocument();
    expect(within(dialog).queryByRole("button", { name: /ver evidencia/i })).not.toBeInTheDocument();
    expect(within(dialog).queryByRole("button", { name: /editar/i })).not.toBeInTheDocument();
    expect(within(dialog).queryByRole("button", { name: /eliminar/i })).not.toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole("button", { name: /cerrar/i }));

    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
  });

  it("filtra por evidencia y no convierte URLs de eventos globales en evidencia", async () => {
    const events = [
      buildAbsence({
        absenceId: "absence-evidence",
        name: "Laura con evidencia",
        link: "http://localhost:3000/uploads/con-evidencia.pdf",
      }),
      buildAbsence({
        absenceId: "absence-no-evidence",
        name: "Laura sin evidencia",
        startDate: "2026-05-12",
        endDate: "2026-05-12",
        link: "",
      }),
      buildGlobalEvent(),
    ];

    setWorkerCalendar({
      viewerRole: "Mantenimiento",
      allEvents: events,
    });

    render(<Calendario />);

    await screen.findByTestId("calendar-event-absence-evidence");
    await screen.findByTestId("calendar-event-absence-no-evidence");
    await waitFor(() =>
      expect(screen.getByText("Evento global con URL")).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByText("Evento global con URL"));

    let dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText("Detalle del evento")).toBeInTheDocument();
    expect(within(dialog).queryByRole("button", { name: /ver evidencia/i })).not.toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole("button", { name: /close modal/i }));

    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );

    fireEvent.click(screen.getByRole("checkbox", { name: /con evidencia/i }));

    await waitFor(() =>
      expect(screen.queryByTestId("calendar-event-absence-evidence"))
        .not.toBeInTheDocument(),
    );
    expect(screen.getByTestId("calendar-event-absence-no-evidence")).toBeInTheDocument();
    expect(screen.getByText("Evento global con URL")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("calendar-event-absence-no-evidence"));
    dialog = await screen.findByRole("dialog");

    expect(within(dialog).getByText("Sin evidencia")).toBeInTheDocument();
    expect(within(dialog).queryByRole("button", { name: /editar/i })).not.toBeInTheDocument();
  });
});
