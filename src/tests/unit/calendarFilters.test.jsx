import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import CalendarFilters from "../../components/molecules/calendarFilters";

const renderCalendarFilters = (props = {}) => {
    const defaultProps = {
        focusFilters: ["eventos"],
        setFocusFilters: vi.fn(),
        focusOptions: [{ value: "eventos", label: "Eventos" }],
        scopeFilters: ["global"],
        setScopeFilters: vi.fn(),
        scopeOptions: [{ value: "global", label: "Global" }],
        eventTypeFilters: ["general"],
        setEventTypeFilters: vi.fn(),
        eventTypeOptions: [{ value: "general", label: "General" }],
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
        absenceStatusFilters: [],
        setAbsenceStatusFilters: vi.fn(),
        absenceStatusOptions: [],
        absenceEvidenceFilters: [],
        setAbsenceEvidenceFilters: vi.fn(),
        absenceEvidenceOptions: [],
        showEventFilters: true,
        showVacationFilters: false,
        showAbscenceFilters: false,
        viewerRole: "Empleado",
        calendarTimeZoneMode: "local",
        onCalendarTimeZoneModeChange: vi.fn(),
        calendarTimeZoneOptions: [
            { value: "local", label: "Horario local" },
            { value: "mexico", label: "Horario central de México" },
        ],
        canSwitchCalendarTimeZone: true,
        showPageHeading: false,
    };

    const mergedProps = { ...defaultProps, ...props };
    render(<CalendarFilters {...mergedProps} />);

    return mergedProps;
};

describe("CalendarFilters", () => {
    it("muestra y alterna los botones de horario cuando el usuario está en zona foránea", () => {
        const props = renderCalendarFilters();

        expect(
            screen.getByRole("button", { name: "Horario local" }),
        ).toHaveClass("bg-[#1F3664]");
        fireEvent.click(
            screen.getByRole("button", { name: "Horario central de México" }),
        );

        expect(props.onCalendarTimeZoneModeChange).toHaveBeenCalledWith(
            "mexico",
        );
    });

    it("oculta los botones de horario cuando no hay zona foránea", () => {
        renderCalendarFilters({ canSwitchCalendarTimeZone: false });

        expect(
            screen.queryByRole("button", { name: "Horario local" }),
        ).not.toBeInTheDocument();
        expect(
            screen.queryByRole("button", {
                name: "Horario central de México",
            }),
        ).not.toBeInTheDocument();
    });
});
