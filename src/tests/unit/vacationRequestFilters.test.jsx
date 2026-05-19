import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import VacationRequestFilters from "../../components/molecules/vacationRequestFilters";

vi.mock("../../components/atoms/vacationDateField", () => ({
    default: ({ label, name, value, onChange }) => (
        <label>
            {label}
            <input
                aria-label={label}
                name={name}
                value={value}
                onChange={onChange}
            />
        </label>
    ),
}));

describe("VacationRequestFilters", () => {
    const defaultProps = {
        view: "pending",
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

    it("renderiza búsqueda y fechas en vista pending", () => {
        render(<VacationRequestFilters {...defaultProps} />);

        expect(screen.getByLabelText("Buscar empleado")).toBeInTheDocument();
        expect(screen.getByLabelText("Fecha de inicio")).toBeInTheDocument();
        expect(screen.getByLabelText("Fecha de término")).toBeInTheDocument();
        expect(screen.queryByLabelText("Filtrar por estado")).toBeNull();
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
            />,
        );

        expect(screen.getByLabelText("Filtrar por estado")).toBeInTheDocument();
        expect(screen.getByRole("option", { name: "Todas" })).toBeInTheDocument();
        expect(screen.getByRole("option", { name: "Aprobadas" })).toBeInTheDocument();
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
