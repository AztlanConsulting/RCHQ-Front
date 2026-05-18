import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import EmployeeSearchSelect from "../../Components/Atoms/EmployeeSearchSelect";

vi.mock("../../Components/Atoms/employeeAvatar", () => ({
    default: () => <div data-testid="employee-avatar" />,
}));

const mockHookReturn = {
    query: "",
    isOpen: false,
    dropdownPos: {
        top: 0,
        left: 0,
        width: 200,
    },
    containerRef: { current: null },
    dropdownRef: { current: null },
    filteredEmployees: [],
    handleInputChange: vi.fn(),
    openDropdown: vi.fn(),
    handleSelect: vi.fn(),
};

vi.mock("../../hooks/atoms/useEmployeeSearchSelect", () => ({
    useEmployeeSearchSelect: vi.fn(() => mockHookReturn),
}));

import { useEmployeeSearchSelect } from "../../hooks/atoms/useEmployeeSearchSelect";

describe("EmployeeSearchSelect", () => {
    const employees = [
        {
            employeeId: "emp-1",
            fullName: "Juan Pérez",
            picture: null,
        },
        {
            employeeId: "emp-2",
            fullName: "María López",
            picture: null,
        },
    ];

    const selected = [
        {
            employeeId: "emp-3",
            fullName: "Pedro García",
            picture: null,
        },
    ];

    const onSelect = vi.fn();
    const onRemove = vi.fn();
    const onSearch = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();

        useEmployeeSearchSelect.mockReturnValue({
            ...mockHookReturn,
            query: "",
            isOpen: false,
            filteredEmployees: [],
            handleInputChange: vi.fn(),
            openDropdown: vi.fn(),
            handleSelect: vi.fn(),
        });
    });

    it("renderiza el label y el placeholder por defecto", () => {
        render(
            <EmployeeSearchSelect
                employees={employees}
                selected={[]}
                onSelect={onSelect}
                onRemove={onRemove}
                onSearch={onSearch}
            />,
        );

        expect(screen.getByText("Empleados")).toBeInTheDocument();
        expect(
            screen.getByPlaceholderText("Buscar empleado..."),
        ).toBeInTheDocument();
    });

    it("renderiza label y placeholder personalizados", () => {
        render(
            <EmployeeSearchSelect
                employees={employees}
                selected={[]}
                onSelect={onSelect}
                onRemove={onRemove}
                onSearch={onSearch}
                label="Seleccionar empleados"
                placeholder="Buscar por nombre"
            />,
        );

        expect(screen.getByText("Seleccionar empleados")).toBeInTheDocument();
        expect(
            screen.getByPlaceholderText("Buscar por nombre"),
        ).toBeInTheDocument();
    });

    it("llama a openDropdown al hacer focus en el input", () => {
        const openDropdown = vi.fn();

        useEmployeeSearchSelect.mockReturnValue({
            ...mockHookReturn,
            openDropdown,
        });

        render(
            <EmployeeSearchSelect
                employees={employees}
                selected={[]}
                onSelect={onSelect}
                onRemove={onRemove}
                onSearch={onSearch}
            />,
        );

        fireEvent.focus(screen.getByPlaceholderText("Buscar empleado..."));

        expect(openDropdown).toHaveBeenCalledTimes(1);
    });

    it("llama a openDropdown al hacer click en el input", () => {
        const openDropdown = vi.fn();

        useEmployeeSearchSelect.mockReturnValue({
            ...mockHookReturn,
            openDropdown,
        });

        render(
            <EmployeeSearchSelect
                employees={employees}
                selected={[]}
                onSelect={onSelect}
                onRemove={onRemove}
                onSearch={onSearch}
            />,
        );

        fireEvent.click(screen.getByPlaceholderText("Buscar empleado..."));

        expect(openDropdown).toHaveBeenCalledTimes(1);
    });

    it("llama a handleInputChange cuando el usuario escribe", () => {
        const handleInputChange = vi.fn();

        useEmployeeSearchSelect.mockReturnValue({
            ...mockHookReturn,
            handleInputChange,
        });

        render(
            <EmployeeSearchSelect
                employees={employees}
                selected={[]}
                onSelect={onSelect}
                onRemove={onRemove}
                onSearch={onSearch}
            />,
        );

        fireEvent.change(screen.getByPlaceholderText("Buscar empleado..."), {
            target: { value: "Juan" },
        });

        expect(handleInputChange).toHaveBeenCalledWith("Juan");
    });

    it("muestra empleados filtrados cuando el dropdown está abierto", () => {
        useEmployeeSearchSelect.mockReturnValue({
            ...mockHookReturn,
            isOpen: true,
            filteredEmployees: employees,
        });

        render(
            <EmployeeSearchSelect
                employees={employees}
                selected={[]}
                onSelect={onSelect}
                onRemove={onRemove}
                onSearch={onSearch}
            />,
        );

        expect(screen.getByText("Juan Pérez")).toBeInTheDocument();
        expect(screen.getByText("María López")).toBeInTheDocument();
    });

    it("llama a handleSelect al seleccionar un empleado", () => {
        const handleSelect = vi.fn();

        useEmployeeSearchSelect.mockReturnValue({
            ...mockHookReturn,
            isOpen: true,
            filteredEmployees: employees,
            handleSelect,
        });

        render(
            <EmployeeSearchSelect
                employees={employees}
                selected={[]}
                onSelect={onSelect}
                onRemove={onRemove}
                onSearch={onSearch}
            />,
        );

        const employeeButton = screen.getByRole("button", {
            name: /juan pérez/i,
        });

        fireEvent.click(employeeButton);

        expect(handleSelect).toHaveBeenCalledWith(employees[0]);
    });

    it("muestra mensaje cuando no encuentra empleados y hay query", () => {
        useEmployeeSearchSelect.mockReturnValue({
            ...mockHookReturn,
            query: "Carlos",
            isOpen: true,
            filteredEmployees: [],
        });

        render(
            <EmployeeSearchSelect
                employees={employees}
                selected={[]}
                onSelect={onSelect}
                onRemove={onRemove}
                onSearch={onSearch}
            />,
        );

        expect(
            screen.getByText("No se encontraron empleados"),
        ).toBeInTheDocument();
    });

    it("no muestra mensaje de no encontrados cuando query está vacío", () => {
        useEmployeeSearchSelect.mockReturnValue({
            ...mockHookReturn,
            query: "",
            isOpen: true,
            filteredEmployees: [],
        });

        render(
            <EmployeeSearchSelect
                employees={employees}
                selected={[]}
                onSelect={onSelect}
                onRemove={onRemove}
                onSearch={onSearch}
            />,
        );

        expect(
            screen.queryByText("No se encontraron empleados"),
        ).not.toBeInTheDocument();
    });

    it("muestra empleados seleccionados", () => {
        render(
            <EmployeeSearchSelect
                employees={employees}
                selected={selected}
                onSelect={onSelect}
                onRemove={onRemove}
                onSearch={onSearch}
            />,
        );

        expect(screen.getByText("Pedro García")).toBeInTheDocument();
    });

    it("llama a onRemove al presionar el botón de remover", () => {
        render(
            <EmployeeSearchSelect
                employees={employees}
                selected={selected}
                onSelect={onSelect}
                onRemove={onRemove}
                onSearch={onSearch}
            />,
        );

        fireEvent.click(screen.getByLabelText("Remover a Pedro García"));

        expect(onRemove).toHaveBeenCalledWith("emp-3");
    });

    it("aplica scroll cuando hay más de 3 empleados seleccionados", () => {
        const manySelected = [
            {
                employeeId: "emp-1",
                fullName: "Juan Pérez",
                picture: null,
            },
            {
                employeeId: "emp-2",
                fullName: "María López",
                picture: null,
            },
            {
                employeeId: "emp-3",
                fullName: "Pedro García",
                picture: null,
            },
            {
                employeeId: "emp-4",
                fullName: "Ana Martínez",
                picture: null,
            },
        ];

        const { container } = render(
            <EmployeeSearchSelect
                employees={employees}
                selected={manySelected}
                onSelect={onSelect}
                onRemove={onRemove}
                onSearch={onSearch}
            />,
        );

        const selectedContainer = container.querySelector(
            ".flex.flex-col.gap-1\\.5",
        );

        expect(selectedContainer).toHaveStyle({
            maxHeight: "162px",
            overflowY: "auto",
        });
    });

    it("pasa las props correctas al hook", () => {
        render(
            <EmployeeSearchSelect
                employees={employees}
                selected={selected}
                onSelect={onSelect}
                onRemove={onRemove}
                onSearch={onSearch}
            />,
        );

        expect(useEmployeeSearchSelect).toHaveBeenCalledWith({
            employees,
            selected,
            onSearch,
            onSelect,
        });
    });
});
