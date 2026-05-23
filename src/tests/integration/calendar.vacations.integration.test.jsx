import { fireEvent, render, screen } from "@testing-library/react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
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

vi.mock("../../hooks/pages/useCalendarSearchParams", () => ({
    useCalendarSearchParams: vi.fn(),
}));

vi.mock("../../components/organism/baseCalendar", () => ({
    default: () => <div data-testid="base-calendar" />,
}));

vi.mock("../../components/molecules/calendarFilters", () => ({
    default: () => <div data-testid="calendar-filters" />,
}));

vi.mock("../../components/molecules/calendarFiltersModal", () => ({
    default: () => null,
}));

vi.mock("../../components/atoms/modal", () => ({
    default: ({ open, children }) =>
        open ? <div role="dialog">{children}</div> : null,
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

const setOwnCalendar = vi.fn();

const renderCalendar = () =>
    render(
        <MemoryRouter>
            <Calendario />
        </MemoryRouter>,
    );

const baseVacation = {
    focus: "vacaciones",
    employeeName: "Ana Pendiente",
    curp: "US170101HDF00003",
    start: new Date(2026, 5, 5, 12),
    end: new Date(2026, 5, 10, 12),
    readableStart: new Date(2026, 5, 5, 12),
    readableEnd: new Date(2026, 5, 10, 12),
    totalDays: 6,
    usedDays: 4,
    status: 0,
    feedback: "",
};

const setCalendarHooks = ({
    viewerRole = "Coordinador",
    event = baseVacation,
} = {}) => {
    const startVacationEdit = vi.fn();
    const cancelVacationEdit = vi.fn();
    const setVacationField = vi.fn();
    const submitVacationEdit = vi.fn();

    useBaseCalendar.mockReturnValue({
        employeeHouseName: "",
        allEvents: [],
        isList: false,
        viewType: "Month",
        currentCalendarView: "dayGridMonth",
        handleDatesSet: vi.fn(),
        loadButtonsAtStart: vi.fn(),
        viewerRole,
        calendarMode: "personal",
        setCalendarMode: vi.fn(),
        calendarModeOptions: [],
        canSwitchCalendarMode: false,
        toggleList: vi.fn(),
        setMonthView: vi.fn(),
        setWeekView: vi.fn(),
        setDayView: vi.fn(),
        openCreationModal: vi.fn(),
        generateTitle: vi.fn(() => "Junio de 2026"),
        getWeekDayName: vi.fn(() => "Lunes"),
        resizeHandler: vi.fn(),
        setOwnCalendar,
        selectedDates: null,
        closeCreationModal: vi.fn(),
        handleDateDrags: vi.fn(),
        handleDateDragging: vi.fn(),
        reloadCurrentRange: vi.fn(),
    });

    useCalendarFilters.mockReturnValue({
        focusFilters: ["vacaciones"],
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
        absenceStatusFilters: [],
        setAbsenceStatusFilters: vi.fn(),
        absenceStatusOptions: [],
        absenceEvidenceFilters: [],
        setAbsenceEvidenceFilters: vi.fn(),
        absenceEvidenceOptions: [],
        showEventFilters: false,
        showVacationFilters: true,
        showAbscenceFilters: false,
        filtersModalOpen: false,
        setFiltersModalOpen: vi.fn(),
        visibleEvents: [],
    });

    useCalendarPage.mockReturnValue({
        selectedEvent: event,
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
        handleEventClick: vi.fn(),
        absenceEvidenceLabel: "Sin evidencia",
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
        isVacationEditing: false,
        vacationForm: {
            startDate: "2026-06-05",
            endDate: "2026-06-10",
        },
        vacationEditError: "",
        isSavingVacation: false,
        startVacationEdit,
        cancelVacationEdit,
        setVacationField,
        submitVacationEdit,
    });
    return {
        startVacationEdit,
        cancelVacationEdit,
        setVacationField,
        submitVacationEdit,
    };
};

describe("Integración: Calendario - vacaciones", () => {
    beforeAll(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
    });

    afterAll(() => {
        vi.useRealTimers();
    });

    it("renderiza VacationDetail cuando el rol es Coordinador", () => {
        vi.setSystemTime(new Date(2026, 5, 1, 12));

        setCalendarHooks({ viewerRole: "Coordinador" });

        renderCalendar();

        expect(screen.getByRole("dialog")).toBeInTheDocument();
        expect(screen.getByText("Nombre del trabajador")).toBeInTheDocument();
        expect(screen.getByText("Ana Pendiente")).toBeInTheDocument();
        expect(screen.getByText("US170101HDF00003")).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: /aprobar/i }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: /rechazar/i }),
        ).toBeInTheDocument();
    });

    it("renderiza VacationWorkerDetail cuando el rol no es Coordinador", () => {
        vi.setSystemTime(new Date(2026, 5, 1, 12));

        setCalendarHooks({ viewerRole: "Cocinero" });

        renderCalendar();

        expect(screen.getByRole("dialog")).toBeInTheDocument();
        expect(
            screen.queryByText("Nombre del trabajador"),
        ).not.toBeInTheDocument();
        expect(screen.queryByText("CURP")).not.toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: /editar/i }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: /eliminar/i }),
        ).toBeInTheDocument();
        expect(
            screen.queryByRole("button", { name: /aprobar/i }),
        ).not.toBeInTheDocument();
        expect(
            screen.queryByRole("button", { name: /rechazar/i }),
        ).not.toBeInTheDocument();
    });

    it("permite iniciar edición desde el detalle de vacaciones", () => {
        vi.setSystemTime(new Date(2026, 5, 1, 12));
        const { startVacationEdit } = setCalendarHooks({
            viewerRole: "Coordinador",
        });
        render(<Calendario />);
        fireEvent.click(screen.getByRole("button", { name: /editar/i }));
        expect(startVacationEdit).toHaveBeenCalledTimes(1);
    });
});
