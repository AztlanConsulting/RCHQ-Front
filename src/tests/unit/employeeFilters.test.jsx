import { render, screen, fireEvent, within } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import EmployeeFilters from "../../components/molecules/employeeFilters";

describe("EmployeeFilters Component", () => {
  const mockSetSearchQuery = vi.fn();
  const mockSetActiveFilter = vi.fn();

  const defaultProps = {
    searchQuery: "",
    setSearchQuery: mockSetSearchQuery,
    activeFilter: "true",
    setActiveFilter: mockSetActiveFilter,
    isBlacklistMode: false,
    onToggleBlacklistMode: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("debe llamar a setSearchQuery automáticamente cada 3 caracteres", () => {
    render(<EmployeeFilters {...defaultProps} />);

    const input = screen.getAllByPlaceholderText(/Ingresa nombre o apellido/i)[0];

    fireEvent.change(input, { target: { value: "Ju" } });
    expect(mockSetSearchQuery).not.toHaveBeenCalled();

    fireEvent.change(input, { target: { value: "Jua" } });
    expect(mockSetSearchQuery).toHaveBeenCalledWith("Jua");

    fireEvent.change(input, { target: { value: "Juan" } });
    expect(mockSetSearchQuery).toHaveBeenCalledTimes(1);

    fireEvent.change(input, { target: { value: "Juan P" } });
    expect(mockSetSearchQuery).toHaveBeenCalledWith("Juan P");
    expect(mockSetSearchQuery).toHaveBeenCalledTimes(2);
  });

  it("debe conservar la búsqueda con Enter", () => {
    render(<EmployeeFilters {...defaultProps} />);

    const input = screen.getAllByPlaceholderText(/Ingresa nombre o apellido/i)[0];

    fireEvent.change(input, { target: { value: "Juan" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    expect(mockSetSearchQuery).toHaveBeenCalledWith("Juan");
  });

  it("debe llamar a setActiveFilter cuando se cambia la opción del select", () => {
    render(<EmployeeFilters {...defaultProps} />);

    const select = screen.getAllByRole("combobox")[0];

    fireEvent.change(select, { target: { value: "false" } });

    expect(mockSetActiveFilter).toHaveBeenCalledWith("false");
  });

  it("debe mostrar los valores iniciales correctos en los campos", () => {
    const propsConValores = {
      ...defaultProps,
      searchQuery: "Admin",
      activeFilter: "false",
    };

    render(<EmployeeFilters {...propsConValores} />);

    const input = screen.getAllByPlaceholderText(/Ingresa nombre o apellido/i)[0];
    const select = screen.getAllByRole("combobox")[0];

    expect(input.value).toBe("Admin");
    expect(select.value).toBe("false");
  });

  it("debe renderizar todas las opciones del select correctamente", () => {
    render(<EmployeeFilters {...defaultProps} />);

    const select = screen.getAllByRole("combobox")[0];
    // Buscamos las opciones solo dentro de ese select e incluimos el placeholder oculto
    const options = within(select).getAllByRole("option", { hidden: true });

    expect(options).toHaveLength(3); // (1 placeholder + 2 opciones)
    expect(options[1]).toHaveTextContent("Activos");
    expect(options[2]).toHaveTextContent("Inactivos");
  });

  it("muestra los campos de CURP y Filtro cuando está en modo lista negra", () => {
    render(<EmployeeFilters {...defaultProps} isBlacklistMode={true} />);

    expect(screen.getAllByPlaceholderText(/Ingresa nombre, apellido o CURP/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText("Lista Empleados")[0]).toBeInTheDocument();
  });

  it("en lista negra solo busca por CURP cada 3 caracteres", () => {
    render(<EmployeeFilters {...defaultProps} isBlacklistMode={true} />);

    const input = screen.getAllByPlaceholderText(/Ingresa nombre, apellido o CURP/i)[0];

    fireEvent.change(input, { target: { value: "AB" } });
    expect(mockSetSearchQuery).not.toHaveBeenCalled();

    fireEvent.change(input, { target: { value: "ABC" } });
    expect(mockSetSearchQuery).toHaveBeenCalledWith("abc");

    fireEvent.change(input, { target: { value: "ABCD" } });
    expect(mockSetSearchQuery).toHaveBeenCalledTimes(1);

    fireEvent.change(input, { target: { value: "ABCDEF" } });
    expect(mockSetSearchQuery).toHaveBeenCalledWith("abcdef");
    expect(mockSetSearchQuery).toHaveBeenCalledTimes(2);
  });

  it("en lista negra permite buscar con Enter aunque no sean 3 caracteres", () => {
    render(<EmployeeFilters {...defaultProps} isBlacklistMode={true} />);

    const input = screen.getAllByPlaceholderText(/Ingresa nombre, apellido o CURP/i)[0];

    fireEvent.change(input, { target: { value: "ABCD" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    expect(mockSetSearchQuery).toHaveBeenCalledWith("abcd");
  });

  it("en lista negra permite buscar por nombre y apellido con acentos", () => {
    render(<EmployeeFilters {...defaultProps} isBlacklistMode={true} />);

    const input = screen.getAllByPlaceholderText(/Ingresa nombre, apellido o CURP/i)[0];

    fireEvent.change(input, { target: { value: "María José" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    expect(mockSetSearchQuery).toHaveBeenCalledWith("maría josé");
    expect(input.value).toBe("María José");
  });

  it("llama a onToggleBlacklistMode al hacer clic en el botón correspondiente", () => {
    render(<EmployeeFilters {...defaultProps} />);

    fireEvent.click(screen.getAllByRole("button", { name: /Lista Negra/i })[0]);
    expect(defaultProps.onToggleBlacklistMode).toHaveBeenCalledTimes(1);
  });
});
