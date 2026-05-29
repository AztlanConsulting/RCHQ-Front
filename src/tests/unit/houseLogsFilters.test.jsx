import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import HouseLogsFilters from "../../components/molecules/houseLogsFilters";

vi.mock("../../components/atoms/dateField", () => ({
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

vi.mock("../../hooks/molecules/useLogsSearch", () => ({
  default: (value, setValue) => ({
    inputValue: value,
    handleChange: (nextValue) => setValue(nextValue),
    handleKeyDown: vi.fn(),
  }),
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

describe("HouseLogsFilters", () => {
  const defaultProps = {
    responsibleQuery: "",
    setResponsibleQuery: vi.fn(),
    affectedQuery: "",
    setAffectedQuery: vi.fn(),
    filteredActionOptions: [],
    selectedActionIds: [],
    actionSearch: "",
    setActionSearch: vi.fn(),
    selectedActionLabel: "Todas las acciones",
    toggleActionValue: vi.fn(),
    clearActionSelection: vi.fn(),
    dateFilter: "",
    setDateFilter: vi.fn(),
    minDate: undefined,
    maxDate: undefined,
    isMobileExpanded: false,
    onToggleMobileFilters: vi.fn(),
  };

  it("muestra y alterna el boton de filtros moviles", () => {
    const onToggleMobileFilters = vi.fn();
    const { rerender } = render(
      <HouseLogsFilters
        {...defaultProps}
        onToggleMobileFilters={onToggleMobileFilters}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Mostrar filtros" }));

    expect(onToggleMobileFilters).toHaveBeenCalledTimes(1);

    rerender(
      <HouseLogsFilters
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
