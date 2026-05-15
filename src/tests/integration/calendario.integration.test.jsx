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
            <span>
                {showAbscenceFilters ? "ausencias-on" : "ausencias-off"}
            </span>
        </div>
    ),
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

vi.mock("../../components/molecules/calendarCards/eventDetail", () => ({
    default: ({ event }) => (
        <div>Evento: {event?.eventType ?? event?.title}</div>
    ),
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

describe("Integración: Calendario page", () => {
    const setOwnCalendar = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();

        useBaseCalendar.mockReturnValue({
            employeeHouseName: "Operaciones CDMX",
            allEvents: [{ id: "1" }],
            isList: false,
            handleDatesSet: vi.fn(),
            loadButtonsAtStart: vi.fn(),
            viewerRole: "Coordinador",
            toggleList: vi.fn(),
            setMonthView: vi.fn(),
            setWeekView: vi.fn(),
            setDayView: vi.fn(),
            generateTitle: vi.fn(() => "Mayo 2026"),
            getWeekDayName: vi.fn(() => "Lunes"),
            resizeHandler: vi.fn(),
            setOwnCalendar,
        });

        useCalendarFilters.mockReturnValue({
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
            absenceEmployeeFilters: [],
            filteredAbsenceEmployeeOptions: [],
            absenceEmployeeSearch: "",
            selectedAbsenceEmployeeLabel: "Todos",
            setAbsenceEmployeeSearch: vi.fn(),
            toggleAbsenceEmployeeValue: vi.fn(),
            clearAbsenceEmployeeSelection: vi.fn(),
            absenceStatusFilters: ["no_eliminadas"],
            setAbsenceStatusFilters: vi.fn(),
            absenceStatusOptions: [],
            absenceEvidenceFilters: [],
            setAbsenceEvidenceFilters: vi.fn(),
            absenceEvidenceOptions: [],
            showEventFilters: false,
            showVacationFilters: false,
            showAbscenceFilters: true,
            visibleEvents: [{ id: "evt-1", title: "Ausencia de Luis" }],
        });

        useCalendarPage.mockReturnValue({
            selectedEvent: null,
            isAbsenceEditing: false,
            closeDetail: vi.fn(),
            handleEventClick: vi.fn(),
            absenceEvidenceLabel: "Ver evidencia",
            openAbsenceEvidence: vi.fn(),
            startAbsenceEdit: vi.fn(),
            cancelAbsenceEdit: vi.fn(),
        });
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
            selectedEvent: {
                focus: "ausencias",
                employeeName: "Luis Martínez",
            },
            isAbsenceEditing: true,
            closeDetail: vi.fn(),
            handleEventClick: vi.fn(),
            absenceEvidenceLabel: "Subir evidencia",
            openAbsenceEvidence: vi.fn(),
            startAbsenceEdit: vi.fn(),
            cancelAbsenceEdit: vi.fn(),
        });

        render(<Calendario />);

        expect(screen.getByTestId("modal")).toBeInTheDocument();
        expect(screen.getByText("sin-titulo")).toBeInTheDocument();
        expect(
            screen.getByText(/ausencia: luis martínez/i),
        ).toBeInTheDocument();
        expect(screen.getByText("editing")).toBeInTheDocument();
        expect(screen.getByText(/subir evidencia/i)).toBeInTheDocument();
    });

    it("renderiza el detalle de evento cuando selectedEvent no es ausencia", () => {
        useCalendarPage.mockReturnValue({
            selectedEvent: {
                focus: "eventos",
                eventType: "General",
            },
            isAbsenceEditing: false,
            closeDetail: vi.fn(),
            handleEventClick: vi.fn(),
            absenceEvidenceLabel: "Ver evidencia",
            openAbsenceEvidence: vi.fn(),
            startAbsenceEdit: vi.fn(),
            cancelAbsenceEdit: vi.fn(),
        });

        render(<Calendario />);

        expect(screen.getByTestId("modal")).toBeInTheDocument();
        expect(screen.getByText("Detalle del evento")).toBeInTheDocument();
        expect(screen.getByText(/evento: general/i)).toBeInTheDocument();
    });
});
