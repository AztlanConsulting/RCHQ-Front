import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import Calendario from "../../pages/calendario";
import { useBaseCalendar } from "../../hooks/organism/useBaseCalendar";
import { useCalendarFilters } from "../../hooks/organism/useCalendarFilters";
import { useCalendarPage } from "../../hooks/pages/useCalendarPage";

vi.mock("../../hooks/organism/useBaseCalendar", () => ({
  useBaseCalendar: vi.fn(),
}));

vi.mock("../../hooks/organism/useCalendarFilters", () => ({
  useCalendarFilters: vi.fn(),
}));

vi.mock("../../hooks/pages/useCalendarPage", () => ({
  useCalendarPage: vi.fn(),
}));

vi.mock("../../components/organism/baseCalendar", () => ({
  default: ({ visibleEvents }) => (
    <div data-testid="base-calendar">Eventos: {visibleEvents.length}</div>
  ),
}));

vi.mock("../../components/molecules/calendarFilters", () => ({
  default: ({ houseName, viewerRole, showAbscenceFilters }) => (
    <div data-testid="calendar-filters">
      <span>{houseName}</span>
      <span>{viewerRole}</span>
      <span>{showAbscenceFilters ? "ausencias-on" : "ausencias-off"}</span>
    </div>
  ),
}));

vi.mock("../../components/molecules/calendarFiltersModal", () => ({
  default: ({ open }) =>
    open ? <div data-testid="calendar-filters-modal" /> : null,
}));

vi.mock("../../components/atoms/modal", () => ({
  default: ({ open, children, title }) =>
    open ? (
      <div data-testid="modal">
        <span>{title ?? "sin-titulo"}</span>
        {children}
      </div>
    ) : null,
}));

vi.mock("../../components/organism/evento/registerEventModal", () => ({
  default: ({ isOpen }) =>
    isOpen ? <div data-testid="register-event-modal" /> : null,
}));

vi.mock("../../components/organism/evento/updateHouseEventModal", () => ({
  default: ({ isOpen }) =>
    isOpen ? <div data-testid="update-house-event-modal" /> : null,
}));

vi.mock("../../components/molecules/calendarCards/eventDetail", () => ({
  default: ({ event }) => <div>Evento: {event?.eventType ?? event?.title}</div>,
}));

vi.mock("../../components/molecules/calendarCards/absenceDetail", () => ({
  default: ({ event, isEditing, evidenceLabel }) => (
    <div>
      <span>Ausencia: {event?.employeeName}</span>
      <span>{isEditing ? "editing" : "read-only"}</span>
      <span>{evidenceLabel}</span>
    </div>
  ),
}));

vi.mock("../../components/molecules/calendarCards/workerAbsenceDetail", () => ({
  default: ({ event, evidenceLabel }) => (
    <div>
      <span>Ausencia trabajador: {event?.employeeName}</span>
      <span>{evidenceLabel}</span>
    </div>
  ),
}));

vi.mock("../../components/molecules/calendarCards/vacationDetail", () => ({
  default: ({ event }) => (
    <div>
      <span>Vacaciones: {event?.employeeName}</span>
      <span>Estado: {event?.status}</span>
    </div>
  ),
}));

describe("Integración: Calendario page", () => {
  const setOwnCalendar = vi.fn();

  const baseCalendarMock = {
    employeeHouseName: "Operaciones CDMX",
    allEvents: [{ id: "1" }],
    isList: false,
    viewType: "Month",
    currentCalendarView: "dayGridMonth",
    handleDatesSet: vi.fn(),
    loadButtonsAtStart: vi.fn(),
    viewerRole: "Coordinador",
    calendarMode: "personal",
    setCalendarMode: vi.fn(),
    calendarModeOptions: [],
    canSwitchCalendarMode: true,
    toggleList: vi.fn(),
    setMonthView: vi.fn(),
    setWeekView: vi.fn(),
    setDayView: vi.fn(),
    openCreationModal: vi.fn(),
    generateTitle: vi.fn(() => "Mayo 2026"),
    getWeekDayName: vi.fn(() => "Lunes"),
    resizeHandler: vi.fn(),
    setOwnCalendar,
    selectedDates: null,
    closeCreationModal: vi.fn(),
    handleDateDrags: vi.fn(),
    handleDateDragging: vi.fn(),
    reloadCurrentRange: vi.fn(),
  };

  const calendarFiltersMock = {
    focusFilters: ["ausencias"],
    setFocusFilters: vi.fn(),
    focusOptions: [],
    scopeFilters: [],
    setScopeFilters: vi.fn(),
    scopeOptions: [],
    eventTypeFilters: [],
    setEventTypeFilters: vi.fn(),
    eventTypeOptions: [],
    vacationStatusFilters: [],
    setVacationStatusFilters: vi.fn(),
    vacationStatusOptions: [],
    absenceTypeFilters: [],
    setAbsenceTypeFilters: vi.fn(),
    absenceTypeOptions: [],
    employeeFilters: [],
    filteredEmployeeOptions: [],
    employeeSearch: "",
    selectedEmployeeLabel: "Todos",
    setEmployeeSearch: vi.fn(),
    toggleEmployeeValue: vi.fn(),
    clearEmployeeSelection: vi.fn(),
    absenceStatusFilters: ["no_eliminadas"],
    setAbsenceStatusFilters: vi.fn(),
    absenceStatusOptions: [],
    absenceEvidenceFilters: [],
    setAbsenceEvidenceFilters: vi.fn(),
    absenceEvidenceOptions: [],
    showEventFilters: false,
    showVacationFilters: false,
    showAbscenceFilters: true,
    filtersModalOpen: false,
    setFiltersModalOpen: vi.fn(),
    visibleEvents: [{ id: "evt-1", title: "Ausencia de Luis" }],
  };

  const calendarPageMock = {
    selectedEvent: null,
    isAbsenceEditing: false,
    absenceForm: {},
    absenceEditError: "",
    isSavingAbsence: false,
    isDeleteAbsenceOpen: false,
    absenceDeleteError: "",
    isLoadingWhileDeleting: false,
    alert: null,
    setAlert: vi.fn(),
    absenceEvidenceFileName: "",
    absenceEvidenceError: "",
    closeDetail: vi.fn(),
    showEventDetail: vi.fn(),
    handleEventClick: vi.fn(),
    absenceEvidenceLabel: "Ver evidencia",
    openAbsenceEvidence: vi.fn(),
    startAbsenceEdit: vi.fn(),
    cancelAbsenceEdit: vi.fn(),
    openDeleteAbsence: vi.fn(),
    cancelDeleteAbsence: vi.fn(),
    confirmDeleteAbsence: vi.fn(),
    setAbsenceField: vi.fn(),
    handleAbsenceEvidenceChange: vi.fn(),
    submitAbsenceEdit: vi.fn(),
    showCalendarAlert: vi.fn(),
    clearCalendarAlert: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    useBaseCalendar.mockReturnValue(baseCalendarMock);
    useCalendarFilters.mockReturnValue(calendarFiltersMock);
    useCalendarPage.mockReturnValue(calendarPageMock);
  });

  it("orquesta filtros, calendario y carga inicial de la page", () => {
    render(<Calendario />);

    expect(setOwnCalendar).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("calendar-filters")).toHaveTextContent(
      "Operaciones CDMX",
    );
    expect(screen.getByTestId("calendar-filters")).toHaveTextContent(
      "Coordinador",
    );
    expect(screen.getByTestId("base-calendar")).toHaveTextContent(
      "Eventos: 1",
    );
  });

  it("renderiza el detalle de ausencia cuando selectedEvent es una ausencia", () => {
    useCalendarPage.mockReturnValue({
      ...calendarPageMock,
      selectedEvent: {
        focus: "ausencias",
        employeeName: "Luis Martínez",
      },
      isAbsenceEditing: true,
      absenceEvidenceLabel: "Subir evidencia",
    });

    render(<Calendario />);

    expect(screen.getByTestId("modal")).toBeInTheDocument();
    expect(screen.getByText("sin-titulo")).toBeInTheDocument();
    expect(screen.getByText(/ausencia: luis martínez/i)).toBeInTheDocument();
    expect(screen.getByText("editing")).toBeInTheDocument();
    expect(screen.getByText(/subir evidencia/i)).toBeInTheDocument();
  });

  it("renderiza el detalle de trabajador para ausencias sin rol administrativo", () => {
    useBaseCalendar.mockReturnValue({
      ...baseCalendarMock,
      viewerRole: "Mantenimiento",
    });

    useCalendarPage.mockReturnValue({
      ...calendarPageMock,
      selectedEvent: {
        focus: "ausencias",
        employeeName: "Luis Martínez",
      },
      absenceEvidenceLabel: "Sin evidencia",
    });

    render(<Calendario />);

    expect(
      screen.getByText(/ausencia trabajador: luis martínez/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/ausencia: luis martínez/i),
    ).not.toBeInTheDocument();
  });

  it("renderiza el detalle de vacaciones cuando selectedEvent es una vacación", () => {
    useCalendarPage.mockReturnValue({
      ...calendarPageMock,
      selectedEvent: {
        focus: "vacaciones",
        employeeName: "Ana López",
        status: 1,
      },
    });

    render(<Calendario />);

    expect(screen.getByTestId("modal")).toBeInTheDocument();
    expect(screen.getByText("sin-titulo")).toBeInTheDocument();
    expect(screen.getByText(/vacaciones: ana lópez/i)).toBeInTheDocument();
    expect(screen.getByText(/estado: 1/i)).toBeInTheDocument();
  });

  it("renderiza el detalle de evento cuando selectedEvent no es ausencia ni vacaciones", () => {
    useCalendarPage.mockReturnValue({
      ...calendarPageMock,
      selectedEvent: {
        focus: "eventos",
        eventType: "General",
      },
    });

    render(<Calendario />);

    expect(screen.getByTestId("modal")).toBeInTheDocument();
    expect(screen.getByText("Detalle del evento")).toBeInTheDocument();
    expect(screen.getByText(/evento: general/i)).toBeInTheDocument();
  });
});
