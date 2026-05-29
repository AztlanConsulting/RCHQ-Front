import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import VacationRequestFilters from "../../components/molecules/vacationRequestFilters";

vi.mock("../../components/atoms/vacationDateField", () => ({
    default: ({
        label,
        name,
        value,
        onChange,
        minDate,
        maxDate,
        calendarStartDate,
    }) => {
        const formatDate = (date) => {
            if (!date) return "";

            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");

            return `${year}-${month}-${day}`;
        };

        return (
            <label>
                {label}
                <input
                    aria-label={label}
                    name={name}
                    value={value}
                    onChange={onChange}
                    data-min-date={formatDate(minDate)}
                    data-max-date={formatDate(maxDate)}
                    data-calendar-start-date={formatDate(calendarStartDate)}
                />
            </label>
        );
    },
}));

describe("VacationRequestFilters", () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    const defaultProps = {
        view: "pending",
        setView: vi.fn(),
        searchQuery: "",
        setSearchQuery: vi.fn(),
        startDate: "",
        setStartDate: vi.fn(),
        endDate: "",
        setEndDate: vi.fn(),
        statusFilter: "all",
        setStatusFilter: vi.fn(),
        clearFilters: vi.fn(),
    };

    it("renderiza selector de vista, búsqueda y fechas en vista pending", () => {
        render(<VacationRequestFilters {...defaultProps} />);

        expect(screen.getByLabelText("Vista de solicitudes")).toBeInTheDocument();
        expect(screen.getByLabelText("Buscar empleado")).toBeInTheDocument();
        expect(screen.getByLabelText("Fecha de inicio")).toBeInTheDocument();
        expect(screen.getByLabelText("Fecha de término")).toBeInTheDocument();
        expect(screen.queryByLabelText("Filtrar por estado")).toBeNull();
    });

    it("llama setView al cambiar la vista de solicitudes", () => {
        const setView = vi.fn();

        render(
            <VacationRequestFilters
                {...defaultProps}
                setView={setView}
            />,
        );

        fireEvent.change(screen.getByLabelText("Vista de solicitudes"), {
            target: { value: "reviewed" },
        });

        expect(setView).toHaveBeenCalledWith("reviewed");
    });

    it("llama setSearchQuery al escribir en búsqueda", () => {
        const setSearchQuery = vi.fn();

        render(
            <VacationRequestFilters
                {...defaultProps}
                setSearchQuery={setSearchQuery}
            />,
        );

        fireEvent.change(screen.getByLabelText("Buscar empleado"), {
            target: { value: "ana" },
        });

        expect(setSearchQuery).toHaveBeenCalled();
    });

    it("renderiza filtro de estado en vista reviewed", () => {
        render(
            <VacationRequestFilters
                {...defaultProps}
                view="reviewed"
                statusFilter="approved"
            />,
        );

        expect(screen.getByLabelText("Filtrar por estado")).toBeInTheDocument();
        expect(screen.getByRole("option", { name: "Todas" })).toBeInTheDocument();
        expect(screen.getByRole("option", { name: "Aprobadas" })).toBeInTheDocument();
        expect(screen.getByRole("option", { name: "Rechazadas" })).toBeInTheDocument();
    });

    it("llama setStatusFilter al cambiar estado", () => {
        const setStatusFilter = vi.fn();

        render(
            <VacationRequestFilters
                {...defaultProps}
                view="reviewed"
                setStatusFilter={setStatusFilter}
            />,
        );

        fireEvent.change(screen.getByLabelText("Filtrar por estado"), {
            target: { value: "approved" },
        });

        expect(setStatusFilter).toHaveBeenCalledWith("approved");
    });

    it("llama setStartDate y setEndDate al cambiar fechas", () => {
        const setStartDate = vi.fn();
        const setEndDate = vi.fn();

        render(
            <VacationRequestFilters
                {...defaultProps}
                setStartDate={setStartDate}
                setEndDate={setEndDate}
            />,
        );

        fireEvent.change(screen.getByLabelText("Fecha de inicio"), {
            target: { value: "2026-05-01" },
        });

        fireEvent.change(screen.getByLabelText("Fecha de término"), {
            target: { value: "2026-05-15" },
        });

        expect(setStartDate).toHaveBeenCalledWith("2026-05-01");
        expect(setEndDate).toHaveBeenCalledWith("2026-05-15");
    });

    it("limita las fechas a 5 años al pasado y 5 años al futuro", () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-05-25T12:00:00"));

        render(
            <VacationRequestFilters
                {...defaultProps}
                startDate="2026-06-10"
                endDate="2026-06-15"
            />,
        );

        const startDateInput = screen.getByLabelText("Fecha de inicio");
        const endDateInput = screen.getByLabelText("Fecha de término");

        expect(startDateInput).toHaveAttribute("data-min-date", "2021-05-25");
        expect(startDateInput).toHaveAttribute("data-max-date", "2026-06-15");
        expect(endDateInput).toHaveAttribute("data-min-date", "2026-06-10");
        expect(endDateInput).toHaveAttribute("data-max-date", "2031-05-25");
        expect(endDateInput).toHaveAttribute(
            "data-calendar-start-date",
            "2026-06-10",
        );
    });

    it("llama clearFilters al presionar Limpiar", () => {
        const clearFilters = vi.fn();

        render(
            <VacationRequestFilters
                {...defaultProps}
                clearFilters={clearFilters}
            />,
        );

        fireEvent.click(screen.getByRole("button", { name: "Limpiar" }));

        expect(clearFilters).toHaveBeenCalledTimes(1);
    });
});
