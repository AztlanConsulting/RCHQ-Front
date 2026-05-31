import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";

import Calendario from "../../pages/calendario";
import { useBaseCalendar } from "../../hooks/organism/useBaseCalendar";
import { useCalendarFilters } from "../../hooks/organism/useCalendarFilters";

vi.mock("../../hooks/organism/useBaseCalendar", () => ({
    useBaseCalendar: vi.fn(),
}));

vi.mock("../../hooks/organism/useCalendarFilters", () => ({
    useCalendarFilters: vi.fn(),
}));

vi.mock("../../hooks/pages/useCalendarSearchParams", () => ({
    useCalendarSearchParams: vi.fn(),
}));

vi.mock("../../hooks/pages/useVacationFormEdit", () => ({
    useVacationFormEdit: vi.fn(() => ({
        isVacationEditing: false,
        vacationForm: {},
        vacationEditError: "",
        isSavingVacation: false,
        vacationRemainingInfo: null,
        vacationDateRules: null,
        isLoadingVacationRemaining: false,
        startVacationEdit: vi.fn(),
        cancelVacationEdit: vi.fn(),
        setVacationField: vi.fn(),
        submitVacationEdit: vi.fn(),
        resetVacationEdit: vi.fn(),
    })),
}));

vi.mock("../../hooks/atoms/useDocumentFile", () => ({
    useDocumentFile: vi.fn(() => ({
        file: null,
        fileName: "",
        error: "",
        handleFileChange: vi.fn(),
        reset: vi.fn(),
    })),
}));

vi.mock("../../services/calendarService", () => ({
    deleteAbsenceService: vi.fn(),
    buildAbsenceEvidenceUrl: vi.fn((link) => link),
    getEmployeeDateRules: vi.fn(),
    updateAbsenceService: vi.fn(),
}));

vi.mock("../../services/deleteEventService", () => ({
    deleteHouseEvent: vi.fn(),
    deletePersonalEvent: vi.fn(),
}));

vi.mock("../../services/vacationService", () => ({
    deleteVacationRequest: vi.fn(),
}));

vi.mock("../../services/vacationRequestService", () => ({
    approveVacationRequest: vi.fn(),
    rejectVacationRequest: vi.fn(),
}));

vi.mock("../../components/organism/baseCalendar", () => ({
    default: ({ visibleEvents = [], onEventClick }) => (
        <div data-testid="personal-events-calendar">
            {visibleEvents.map((event) => (
                <button
                    key={event.id}
                    type="button"
                    data-testid={`calendar-event-${event.id}`}
                    onClick={() => onEventClick?.({ event })}
                >
                    {event.title}
                </button>
            ))}
        </div>
    ),
}));

vi.mock("../../components/molecules/calendarFilters", () => ({
    default: () => <div data-testid="calendar-filters" />,
}));

vi.mock("../../components/molecules/calendarFiltersModal", () => ({
    default: () => null,
}));

vi.mock("../../components/atoms/modal", () => ({
    default: ({ open, title, children }) =>
        open ? (
            <div role="dialog" aria-label={title ?? "detalle-evento"}>
                {title ? <h2>{title}</h2> : null}
                {children}
            </div>
        ) : null,
}));

vi.mock("../../components/organism/evento/registerEventModal", () => ({
    default: () => null,
}));

vi.mock("../../components/organism/evento/updateHouseEventModal", () => ({
    default: () => null,
}));

vi.mock("../../components/organism/evento/updatePersonalEventModal", () => ({
    default: () => null,
}));

vi.mock("../../components/molecules/confirmDeleteVacationModal", () => ({
    default: () => null,
}));

vi.mock("../../components/molecules/confirmApproveVacationModal", () => ({
    default: () => null,
}));

vi.mock("../../components/molecules/confirmRejectVacationModal", () => ({
    default: () => null,
}));

const renderCalendar = () =>
    render(
        <MemoryRouter>
            <Calendario />
        </MemoryRouter>,
    );

const buildPersonalTrainingEvent = (overrides = {}) => {
    const baseStart = new Date("2026-05-10T09:00:00.000Z");
    const baseEnd = new Date("2026-05-10T11:00:00.000Z");
    const eventId = overrides.eventId ?? "training-001";
    const scope = overrides.scope ?? "personal";

    return {
        id: eventId,
        title: overrides.title ?? "Capacitacion de primeros auxilios",
        start: overrides.start ?? baseStart,
        end: overrides.end ?? baseEnd,
        allDay: false,
        backgroundColor: "#4A90D9",
        borderColor: "#4A90D9",
        extendedProps: {
            eventId,
            focus: "eventos",
            focusLabel: "Eventos",
            scope,
            scopeLabel: scope === "house" ? "Casa" : "Personal",
            eventType: "Capacitaciones",
            description:
                overrides.description ??
                "Uso correcto del botiquin y protocolo interno.",
            trainer: overrides.trainer ?? "Dra. Martinez",
            peopleInsideEvent: overrides.peopleInsideEvent ?? [
                { id: "worker-1", name: "Laura Mendoza" },
                { id: "worker-2", name: "Juan Perez" },
            ],
            subtitle: overrides.subtitle ?? "Sala de juntas",
        },
    };
};

const setCalendarState = ({
    viewerRole = "Mantenimiento",
    allEvents = [],
} = {}) => {
    useBaseCalendar.mockReturnValue({
        employeeHouseName: "Casa Norte",
        allEvents,
        isList: false,
        viewType: "Month",
        currentCalendarView: "dayGridMonth",
        currentCalendarDate: new Date(2026, 4, 10),
        handleDatesSet: vi.fn(),
        loadButtonsAtStart: vi.fn(),
        viewerRole,
        calendarMode: "personal",
        setCalendarMode: vi.fn(),
        calendarTimeZone: "UTC",
        calendarNow: "2026-05-10T12:00:00.000Z",
        calendarTimeZoneMode: "mexico",
        setCalendarTimeZoneMode: vi.fn(),
        calendarTimeZoneOptions: [],
        canSwitchCalendarTimeZone: false,
        fullCalendarTimeZone: "UTC",
        calendarModeOptions: [],
        canSwitchCalendarMode: viewerRole === "Coordinador",
        toggleList: vi.fn(),
        setMonthView: vi.fn(),
        setWeekView: vi.fn(),
        setDayView: vi.fn(),
        openCreationModal: vi.fn(),
        generateTitle: vi.fn(() => "Mayo de 2026"),
        getWeekDayName: vi.fn(() => "Lunes"),
        resizeHandler: vi.fn(),
        setOwnCalendar: vi.fn(),
        selectedDates: null,
        closeCreationModal: vi.fn(),
        handleDateDrags: vi.fn(),
        handleDateDragging: vi.fn(),
        reloadCurrentRange: vi.fn(),
        reloadVisibleRange: vi.fn(),
    });

    useCalendarFilters.mockImplementation((incomingEvents) => ({
        focusFilters: ["eventos"],
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
        selectedEmployeeLabel: "",
        setEmployeeSearch: vi.fn(),
        toggleEmployeeValue: vi.fn(),
        clearEmployeeSelection: vi.fn(),
        resetEmployeeSelection: vi.fn(),
        absenceStatusFilters: [],
        setAbsenceStatusFilters: vi.fn(),
        absenceStatusOptions: [],
        absenceEvidenceFilters: [],
        setAbsenceEvidenceFilters: vi.fn(),
        absenceEvidenceOptions: [],
        showEventFilters: true,
        showVacationFilters: false,
        showAbscenceFilters: false,
        filtersModalOpen: false,
        setFiltersModalOpen: vi.fn(),
        visibleEvents: incomingEvents,
    }));
};

describe("Integracion: consulta de capacitaciones personales", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("al dar click en una capacitacion muestra los datos registrados correctamente", () => {
        setCalendarState({
            viewerRole: "Mantenimiento",
            allEvents: [
                buildPersonalTrainingEvent({
                    title: "Capacitacion de primeros auxilios",
                    trainer: "Dra. Martinez",
                    description:
                        "Uso correcto del botiquin y protocolo interno.",
                }),
            ],
        });

        renderCalendar();

        fireEvent.click(screen.getByTestId("calendar-event-training-001"));

        const dialog = screen.getByRole("dialog", {
            name: /detalle del evento/i,
        });

        expect(
            within(dialog).getByRole("heading", {
                level: 2,
                name: "Capacitacion de primeros auxilios",
            }),
        ).toBeInTheDocument();
        expect(within(dialog).getByText("Personal")).toBeInTheDocument();
        expect(
            within(dialog).getByText("Eventos · Capacitaciones"),
        ).toBeInTheDocument();
        expect(
            within(dialog).getByText(
                "Uso correcto del botiquin y protocolo interno.",
            ),
        ).toBeInTheDocument();
        expect(within(dialog).getByText("Dra. Martinez")).toBeInTheDocument();
        expect(within(dialog).getByText("Laura Mendoza")).toBeInTheDocument();
        expect(within(dialog).getByText("Juan Perez")).toBeInTheDocument();
        expect(
            within(dialog).getByText("10 de mayo de 2026"),
        ).toBeInTheDocument();
        expect(within(dialog).getByText("9:00 a.m.")).toBeInTheDocument();
        expect(within(dialog).getByText("11:00 a.m.")).toBeInTheDocument();
    });

    it("con cualquier rol de trabajador no muestra botones de accion en el detalle", () => {
        setCalendarState({
            viewerRole: "Psicologa",
            allEvents: [buildPersonalTrainingEvent()],
        });

        renderCalendar();

        fireEvent.click(screen.getByTestId("calendar-event-training-001"));

        const dialog = screen.getByRole("dialog", {
            name: /detalle del evento/i,
        });

        expect(
            within(dialog).queryByRole("button", { name: /editar/i }),
        ).not.toBeInTheDocument();
        expect(
            within(dialog).queryByRole("button", { name: /eliminar/i }),
        ).not.toBeInTheDocument();
    });

    it("con rol de coordinador muestra capacitaciones de casa con botones de accion", () => {
        setCalendarState({
            viewerRole: "Coordinador",
            allEvents: [
                buildPersonalTrainingEvent({
                    eventId: "training-house-001",
                    title: "Curso de induccion",
                    scope: "house",
                    trainer: "Lic. Ochoa",
                }),
            ],
        });

        renderCalendar();

        fireEvent.click(screen.getByTestId("calendar-event-training-house-001"));

        const dialog = screen.getByRole("dialog", {
            name: /detalle del evento/i,
        });

        expect(within(dialog).getByText("Casa")).toBeInTheDocument();
        expect(
            within(dialog).getByRole("button", { name: /editar/i }),
        ).toBeInTheDocument();
        expect(
            within(dialog).getByRole("button", { name: /eliminar/i }),
        ).toBeInTheDocument();
    });

    it("si no hay instructor no renderiza la etiqueta de capacitador", () => {
        setCalendarState({
            viewerRole: "Coordinador",
            allEvents: [
                buildPersonalTrainingEvent({
                    eventId: "training-no-trainer",
                    trainer: "",
                }),
            ],
        });

        renderCalendar();

        fireEvent.click(screen.getByTestId("calendar-event-training-no-trainer"));

        const dialog = screen.getByRole("dialog", {
            name: /detalle del evento/i,
        });

        expect(
            within(dialog).queryByText(/capacitador:/i),
        ).not.toBeInTheDocument();
        expect(within(dialog).getByText("Capacitacion de primeros auxilios")).toBeInTheDocument();
    });
});
