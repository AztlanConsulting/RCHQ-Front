import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import LogsFilters from "../../components/molecules/logsFilters";

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

vi.mock("../../components/molecules/searchableCheckboxDropdown", () => ({
    default: ({ label }) => (
        <label>
            {label}
            <select aria-label={label}>
                <option>Todas las acciones</option>
            </select>
        </label>
    ),
}));

vi.mock("../../components/molecules/inlineSearchableCheckboxDropdown", () => ({
    default: ({ label }) => (
        <label data-testid="inline-action-dropdown">
            {label}
            <select aria-label={`${label} inline`}>
                <option>Todas las acciones</option>
            </select>
        </label>
    ),
}));

describe("LogsFilters", () => {
    const defaultProps = {
        searchQuery: "",
        setSearchQuery: vi.fn(),
        actionOptions: [],
        selectedActionIds: [],
        actionSearch: "",
        setActionSearch: vi.fn(),
        startDate: "",
        endDate: "",
        onStartDateChange: vi.fn(),
        onEndDateChange: vi.fn(),
        selectedActionLabel: "Todas las acciones",
        toggleActionValue: vi.fn(),
        clearActionSelection: vi.fn(),
        isMobileExpanded: false,
        onToggleMobileFilters: vi.fn(),
    };

    it("muestra el boton colapsable en resoluciones compactas", () => {
        const onToggleMobileFilters = vi.fn();
        const { rerender } = render(
            <LogsFilters
                {...defaultProps}
                onToggleMobileFilters={onToggleMobileFilters}
            />,
        );

        fireEvent.click(screen.getByRole("button", { name: "Mostrar filtros" }));

        expect(onToggleMobileFilters).toHaveBeenCalledTimes(1);

        rerender(
            <LogsFilters
                {...defaultProps}
                isMobileExpanded
                onToggleMobileFilters={onToggleMobileFilters}
            />,
        );

        expect(
            screen.getByRole("button", { name: "Ocultar filtros" }),
        ).toBeInTheDocument();
    });

    it("mantiene el panel visible en escritorio aunque isMobileExpanded sea false", () => {
        render(
            <LogsFilters
                {...defaultProps}
            />,
        );

        expect(screen.getByRole("button", { name: /mostrar filtros/i })).toBeInTheDocument();
        expect(screen.getByLabelText("Buscar trabajador")).toBeInTheDocument();
        expect(screen.getByLabelText("ACCIONES")).toBeInTheDocument();
    });
});
