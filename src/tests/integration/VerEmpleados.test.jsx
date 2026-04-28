import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BrowserRouter } from "react-router-dom";
import Personal from "../../Pages/Personal";
import { useEmployees } from "../../hooks/Pages/useGetAllEmployees";

vi.mock("../../hooks/Pages/useGetAllEmployees", () => ({
    useEmployees: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return { ...actual, useNavigate: () => mockNavigate };
});

describe("Integración: Componente Personal", () => {
    const mockData = {
        employees: [
            {
                employeeId: "1",
                fullName: "Juan Perez",
                role: "Gerente",
                status: true,
            },
            {
                employeeId: "2",
                fullName: "Maria Lopez",
                role: "Ventas",
                status: false,
            },
        ],
        pagination: { totalPages: 3, total: 20 },
        loading: false,
        error: null,
        searchQuery: "",
        setSearchQuery: vi.fn(),
        activeFilter: "true",
        setActiveFilter: vi.fn(),
        page: 1,
        handleNextPage: vi.fn(),
        handlePrevPage: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        useEmployees.mockReturnValue(mockData);
    });

    const renderComponent = () =>
        render(
            <BrowserRouter>
                <Personal />
            </BrowserRouter>,
        );

    it("debe orquestar el flujo completo: Título, Botón, Filtros, Tabla y Paginación", () => {
        renderComponent();

        expect(screen.getByText("Usuarios de la Casa")).toBeInTheDocument();
        expect(
            screen.getByPlaceholderText(/ingresa nombre o apellido/i),
        ).toBeInTheDocument();
        expect(screen.getByText("Juan Perez")).toBeInTheDocument();
        expect(screen.getByText(/página 1 de 3/i)).toBeInTheDocument();
    });

    it('debe llamar a la navegación al hacer clic en "Añadir Nuevo Usuario"', () => {
        renderComponent();
        const btnNuevo = screen.getByText(/añadir nuevo usuario/i);
        fireEvent.click(btnNuevo);

        expect(mockNavigate).toHaveBeenCalledWith("/app/personal/nuevo");
    });

    it("debe conectar el cambio de búsqueda con la función del hook", () => {
        renderComponent();
        const input = screen.getByPlaceholderText(/ingresa nombre o apellido/i);

        fireEvent.change(input, { target: { value: "Carlos" } });

        expect(mockData.setSearchQuery).toHaveBeenCalledWith("Carlos");
    });

    it("debe manejar el cambio de página a través del hook", () => {
        renderComponent();
        const btnSiguiente = screen.getByRole("button", { name: /siguiente/i });

        fireEvent.click(btnSiguiente);

        expect(mockData.handleNextPage).toHaveBeenCalled();
    });

    it("debe priorizar el estado de carga (Loading)", () => {
        useEmployees.mockReturnValue({
            ...mockData,
            loading: true,
            employees: [],
        });

        renderComponent();

        expect(screen.getByText(/cargando empleados/i)).toBeInTheDocument();
        expect(screen.queryByText(/página 1 de 3/i)).not.toBeInTheDocument();
    });
});
