import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import EmployeeFilters from "../../components/molecules/employeeFilters";

vi.mock("../../hooks/molecules/useSearch", () => ({
  default: (query, setQuery) => ({
    inputValue: query ?? "",
    handleChange: (val) => setQuery(val),
    handleKeyDown: (e) => {
      if (e.key === "Enter") setQuery(e.target.value);
    },
  }),
}));

const STATUS_OPTIONS = [
  { value: "true",  label: "Activos" },
  { value: "false", label: "Inactivos" },
];

const defaultProps = {
  searchQuery:    "",
  setSearchQuery: vi.fn(),
  activeFilter:   "",
  setActiveFilter: vi.fn(),
  statusOptions:  STATUS_OPTIONS,
};

describe("EmployeeFilters — renderizado base", () => {
  it("muestra el campo de búsqueda con placeholder por defecto", () => {
    render(<EmployeeFilters {...defaultProps} />);
    expect(
      screen.getByPlaceholderText(/ingresa nombre o apellido/i),
    ).toBeInTheDocument();
  });

  it("muestra el label de búsqueda personalizado", () => {
    render(
      <EmployeeFilters {...defaultProps} searchLabel="Buscar por Nombre" />,
    );
    expect(screen.getByText("Buscar por Nombre")).toBeInTheDocument();
  });

  it("muestra el statusLabel personalizado", () => {
    render(
      <EmployeeFilters {...defaultProps} statusLabel="Filtrar por estado" />,
    );
    expect(screen.getByText("Filtrar por estado")).toBeInTheDocument();
  });

  it("renderiza las opciones del select de status", () => {
    render(<EmployeeFilters {...defaultProps} />);
    expect(screen.getByText("Activos")).toBeInTheDocument();
    expect(screen.getByText("Inactivos")).toBeInTheDocument();
  });

  it("renderiza children adicionales dentro del grid", () => {
    render(
      <EmployeeFilters {...defaultProps}>
        <div data-testid="extra-filter">Filtro extra</div>
      </EmployeeFilters>,
    );
    expect(screen.getByTestId("extra-filter")).toBeInTheDocument();
  });
});

describe("EmployeeFilters — grid según cols", () => {
  it("aplica grid-cols-2 con cols=2 (default)", () => {
    const { container } = render(<EmployeeFilters {...defaultProps} cols={2} />);
    const grid = container.querySelector(".grid");
    expect(grid.className).toContain("sm:grid-cols-2");
  });

  it("aplica grid-cols-3 con cols=3", () => {
    const { container } = render(<EmployeeFilters {...defaultProps} cols={3} />);
    const grid = container.querySelector(".grid");
    expect(grid.className).toContain("lg:grid-cols-3");
  });
});

describe("EmployeeFilters — interacción", () => {
  it("llama a setSearchQuery al escribir y presionar Enter", () => {
    const setSearchQuery = vi.fn();
    render(
      <EmployeeFilters {...defaultProps} setSearchQuery={setSearchQuery} />,
    );
    const input = screen.getByPlaceholderText(/ingresa nombre o apellido/i);
    fireEvent.change(input, { target: { value: "Carlos" } });
    fireEvent.keyDown(input, { key: "Enter", target: { value: "Carlos" } });
    expect(setSearchQuery).toHaveBeenCalledWith("Carlos");
  });

  it("llama a setActiveFilter al cambiar el select", () => {
    const setActiveFilter = vi.fn();
    render(
      <EmployeeFilters {...defaultProps} setActiveFilter={setActiveFilter} />,
    );
    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "false" } });
    expect(setActiveFilter).toHaveBeenCalledWith("false");
  });
});