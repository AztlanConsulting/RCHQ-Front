import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import VacationListFilters from "../../components/molecules/vacationListFilters";

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

describe("VacationListFilters", () => {
    const defaultProps = {
        view: "future",
        setView: vi.fn(),
        startDate: "",
        setStartDate: vi.fn(),
        endDate: "",
        setEndDate: vi.fn(),
        statusFilter: "all",
        setStatusFilter: vi.fn(),
        clearFilters: vi.fn(),
        isMobileExpanded: false,
        onToggleMobileFilters: vi.fn(),
    };

    it("muestra pendientes solo en la vista future", () => {
        const { rerender } = render(<VacationListFilters {...defaultProps} />);

        const futureStatusSelect = screen.getByLabelText("Filtrar por estado");
        expect(
            within(futureStatusSelect).getByRole("option", {
                name: "Pendientes",
            }),
        ).toBeInTheDocument();

        rerender(
            <VacationListFilters
                {...defaultProps}
                view="past"
            />,
        );

        const pastStatusSelect = screen.getByLabelText("Filtrar por estado");
        expect(
            within(pastStatusSelect).queryByRole("option", {
                name: "Pendientes",
            }),
        ).toBeNull();
    });

    it("usa el boton movil para expandir o colapsar filtros", () => {
        const onToggleMobileFilters = vi.fn();
        const { rerender } = render(
            <VacationListFilters
                {...defaultProps}
                onToggleMobileFilters={onToggleMobileFilters}
            />,
        );

        fireEvent.click(screen.getByRole("button", { name: "Mostrar filtros" }));

        expect(onToggleMobileFilters).toHaveBeenCalledTimes(1);

        rerender(
            <VacationListFilters
                {...defaultProps}
                isMobileExpanded
                onToggleMobileFilters={onToggleMobileFilters}
            />,
        );

        expect(
            screen.getByRole("button", { name: "Ocultar filtros" }),
        ).toBeInTheDocument();
    });
});
