import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BrowserRouter } from "react-router-dom";
import Personal from "../../Pages/personal";
import usePersonal from "../../hooks/pages/usePersonal";

vi.mock("../../hooks/pages/usePersonal", () => ({
    default: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

describe("Integración: Componente Personal", () => {
  const mockPersonalData = {
    isBlacklistMode: false,
    selectedEmployee: null,
    isModalOpen: false,
    isRemoveModalOpen: false,
    isSubmitting: false,
    alert: null,
    setAlert: vi.fn(),
    handleToggleBlacklistMode: vi.fn(),
    handleAddToBlacklist: vi.fn(),
    handleModalCancel: vi.fn(),
    handleModalConfirm: vi.fn(),
    handleRemoveFromBlacklist: vi.fn(),
    handleRemoveModalCancel: vi.fn(),
    handleRemoveModalConfirm: vi.fn(),
    activeEmployees: [
      {
        employeeId: "1",
        fullName: "Juan Perez",
        roleName: "Gerente",
        status: true,
      },
      {
        employeeId: "2",
        fullName: "Maria Lopez",
        roleName: "Ventas",
        status: false,
      },
    ],
    activePagination: { totalPages: 3, total: 20 },
    activeLoading: false,
    activeError: null,
    activePage: 1,
    activeNextPage: vi.fn(),
    activePrevPage: vi.fn(),
    activeSearchQuery: "",
    activeSetSearchQuery: vi.fn(),
    activeFilter: "true",
    setActiveFilter: vi.fn(),
    isBlacklistedFilter: undefined,
    setIsBlacklistedFilter: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    usePersonal.mockReturnValue(mockPersonalData);
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
      screen.getAllByPlaceholderText(/ingresa nombre o apellido/i)[0],
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
    const input = screen.getAllByPlaceholderText(/ingresa nombre o apellido/i)[0];

    fireEvent.change(input, { target: { value: "Carlos" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    expect(mockPersonalData.activeSetSearchQuery).toHaveBeenCalledWith("Carlos");
  });

  it("debe manejar el cambio de página a través del hook", () => {
    renderComponent();
    const btnSiguiente = screen.getByRole("button", { name: /siguiente/i });

    fireEvent.click(btnSiguiente);

    expect(mockPersonalData.activeNextPage).toHaveBeenCalled();
  });

  it("debe priorizar el estado de carga (Loading)", () => {
    usePersonal.mockReturnValue({
      ...mockPersonalData,
      activeLoading: true,
      activeEmployees: [],
    });

    renderComponent();

    expect(screen.getByText(/cargando empleados/i)).toBeInTheDocument();
    expect(screen.queryByText(/página 1 de 3/i)).not.toBeInTheDocument();
  });

  it("debe llamar a handleToggleBlacklistMode al hacer clic en 'Lista Negra'", () => {
    renderComponent();
    const btnListaNegra = screen.getAllByRole("button", { name: /lista negra/i })[0];
    fireEvent.click(btnListaNegra);
    expect(mockPersonalData.handleToggleBlacklistMode).toHaveBeenCalled();
  });

  it("debe mostrar el banner cuando isBlacklistMode es true", () => {
    usePersonal.mockReturnValue({
      ...mockPersonalData,
      isBlacklistMode: true,
    });
    renderComponent();
    expect(screen.getAllByText(/Estás en modo de lista negra/i)[0]).toBeInTheDocument();
  });

  it("oculta la paginación cuando la lista negra filtrada no tiene resultados", () => {
    usePersonal.mockReturnValue({
      ...mockPersonalData,
      isBlacklistMode: true,
      activeEmployees: [],
      activePagination: { totalPages: 0, total: 0 },
    });

    renderComponent();

    expect(screen.getByText(/no hay personas en la lista negra/i)).toBeInTheDocument();
    expect(screen.queryByText(/página/i)).not.toBeInTheDocument();
  });
});
