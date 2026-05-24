import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BrowserRouter } from "react-router-dom";
import Personal from "../../Pages/personal";
import { useEmployees } from "../../hooks/pages/useGetAllEmployees";
import { useGetBlacklist } from "../../hooks/pages/useGetBlacklist";
import { addToBlacklist } from "../../services/blacklistService";

vi.mock("../../hooks/pages/useGetAllEmployees", () => ({
    useEmployees: vi.fn(),
}));
vi.mock("../../hooks/pages/useGetBlacklist", () => ({
    useGetBlacklist: vi.fn(),
}));
vi.mock("../../services/blacklistService", () => ({
    addToBlacklist: vi.fn(),
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

  const mockBlacklistData = {
    employees: [],
    pagination: { totalPages: 1, total: 0 },
    loading: false,
    error: null,
    searchQuery: "",
    setSearchQuery: vi.fn(),
    isBlacklistedFilter: undefined,
    setIsBlacklistedFilter: vi.fn(),
    page: 1,
    handleNextPage: vi.fn(),
    handlePrevPage: vi.fn(),
    refresh: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useEmployees.mockReturnValue(mockData);
    useGetBlacklist.mockReturnValue(mockBlacklistData);
  });

  const renderComponent = () =>
    render(
      <BrowserRouter>
        <Personal />
      </BrowserRouter>,
    );

  it("debe orquestar el flujo completo: Título, Botón, Filtros, Tabla y Paginación", () => {
    renderComponent();

    expect(screen.getByText("Usuarios")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/ingresa nombre o apellido/i),
    ).toBeInTheDocument();
    expect(screen.getByText("Juan Perez")).toBeInTheDocument();
    expect(screen.getByText(/página 1 de 3/i)).toBeInTheDocument();
  });

  it('debe llamar a la navegación al hacer clic en "Añadir"', () => {
    renderComponent();
    const btnNuevo = screen.getByText(/añadir/i);
    fireEvent.click(btnNuevo);

    expect(mockNavigate).toHaveBeenCalledWith("/app/personal/nuevo");
  });

  it("debe conectar el cambio de búsqueda con la función del hook", () => {
    renderComponent();
    const input = screen.getByPlaceholderText(/ingresa nombre o apellido/i);

    fireEvent.change(input, { target: { value: "Carlos" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

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

  it("debe cambiar a modo lista negra y mostrar el banner al hacer clic en 'Lista Negra'", async () => {
    renderComponent();
    const btnListaNegra = screen.getAllByRole("button", { name: /lista negra/i })[0];
    fireEvent.click(btnListaNegra);
    expect(await screen.findByText(/Estás en modo de lista negra/i)).toBeInTheDocument();
  });
});
