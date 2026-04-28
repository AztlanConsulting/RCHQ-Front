import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import EmployeeFilters from "../../Components/Molecules/EmployeeFilters";

describe("EmployeeFilters Component", () => {
    const mockSetSearchQuery = vi.fn();
    const mockSetActiveFilter = vi.fn();

    const defaultProps = {
        searchQuery: "",
        setSearchQuery: mockSetSearchQuery,
        activeFilter: "true",
        setActiveFilter: mockSetActiveFilter,
    };

    it("debe llamar a setSearchQuery cuando el usuario escribe en el campo de búsqueda", () => {
        render(<EmployeeFilters {...defaultProps} />);

        const input = screen.getByPlaceholderText(/ingresa nombre o apellido/i);

        fireEvent.change(input, { target: { value: "Juan" } });

        expect(mockSetSearchQuery).toHaveBeenCalledWith("Juan");
    });

    it("debe llamar a setActiveFilter cuando se cambia la opción del select", () => {
        render(<EmployeeFilters {...defaultProps} />);

        const select = screen.getByLabelText(/estado \(activo\/inactivo\)/i);

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

        const input = screen.getByPlaceholderText(/ingresa nombre o apellido/i);
        const select = screen.getByLabelText(/estado \(activo\/inactivo\)/i);

        expect(input.value).toBe("Admin");
        expect(select.value).toBe("false");
    });

    it("debe renderizar todas las opciones del select correctamente", () => {
        render(<EmployeeFilters {...defaultProps} />);

        const options = screen.getAllByRole("option");

        expect(options).toHaveLength(2);
        expect(options[0]).toHaveTextContent("Activos");
        expect(options[1]).toHaveTextContent("Inactivos");
    });
});
