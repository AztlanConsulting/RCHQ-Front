import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import usePersonal from "../../hooks/pages/usePersonal";
import RemoveFromBlacklistModal from "../../components/molecules/removeFromBlacklistModal";
import { removeFromBlacklist } from "../../services/blacklistService";
import { useEmployees } from "../../hooks/pages/useGetAllEmployees";
import { useGetBlacklist } from "../../hooks/pages/useGetBlacklist";

vi.mock("../../services/blacklistService", () => ({
  removeFromBlacklist: vi.fn(),
  addToBlacklist: vi.fn(),
}));

vi.mock("../../hooks/pages/useGetAllEmployees", () => ({
  useEmployees: vi.fn(),
}));

vi.mock("../../hooks/pages/useGetBlacklist", () => ({
  useGetBlacklist: vi.fn(),
}));

const TestIntegrationComponent = () => {
  const {
    isRemoveModalOpen,
    selectedEmployee,
    isSubmitting,
    handleRemoveFromBlacklist,
    handleRemoveModalCancel,
    handleRemoveModalConfirm,
    alert
  } = usePersonal();

  return (
    <div>
      {alert && <div role="alert">{alert.message}</div>}
      <button onClick={() => handleRemoveFromBlacklist({ curp: "TESTCURP123", fullName: "María Gómez" })}>
        Abrir Modal
      </button>
      <RemoveFromBlacklistModal
        isOpen={isRemoveModalOpen}
        employeeName={selectedEmployee?.fullName ?? ""}
        onConfirm={handleRemoveModalConfirm}
        onCancel={handleRemoveModalCancel}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

describe("Integración: Eliminar empleado de la lista negra", () => {
  const refreshMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    useEmployees.mockReturnValue({
      employees: [],
      pagination: {},
    });

    useGetBlacklist.mockReturnValue({
      employees: [],
      pagination: {},
      refresh: refreshMock,
    });
  });

  const renderAndOpenModal = async () => {
    render(<TestIntegrationComponent />);
    
    fireEvent.click(screen.getByText("Abrir Modal"));
    
    expect(await screen.findByText(/Estás a punto de ELIMINAR de la lista negra a "María Gómez"/i)).toBeInTheDocument();
  };

  it("valida que la razón no esté vacía", async () => {
    await renderAndOpenModal();
    
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Aceptar" }));
    });

    expect(await screen.findByText("La razón es obligatoria")).toBeInTheDocument();
    expect(removeFromBlacklist).not.toHaveBeenCalled();
  });

  it("envía la petición correctamente y actualiza la lista", async () => {
    removeFromBlacklist.mockResolvedValueOnce({ success: true, message: "Eliminado exitosamente" });
    await renderAndOpenModal();

    fireEvent.change(screen.getByPlaceholderText("Escribe la razón para eliminar de la lista negra..."), {
      target: { value: "Se aclaró el malentendido" },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Aceptar" }));
    });

    expect(removeFromBlacklist).toHaveBeenCalledWith("TESTCURP123", "Se aclaró el malentendido");
    expect(await screen.findByRole("alert")).toHaveTextContent("Empleado eliminado de la lista negra correctamente.");
    expect(refreshMock).toHaveBeenCalledTimes(1);
  });

  it("maneja correctamente un error del servicio (ej. empleado no encontrado 404)", async () => {
    const error = new Error("Empleado no encontrado.");
    error.status = 404;
    removeFromBlacklist.mockRejectedValueOnce(error);
    
    await renderAndOpenModal();

    fireEvent.change(screen.getByPlaceholderText("Escribe la razón para eliminar de la lista negra..."), {
      target: { value: "Intento de remover" },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Aceptar" }));
    });

    expect(await screen.findByRole("alert")).toHaveTextContent("Empleado no encontrado.");
  });

  it("maneja correctamente un error de permisos (403)", async () => {
    const error = new Error("No tienes permisos para realizar esta acción.");
    error.status = 403;
    removeFromBlacklist.mockRejectedValueOnce(error);
    
    await renderAndOpenModal();
    fireEvent.change(screen.getByPlaceholderText("Escribe la razón para eliminar de la lista negra..."), { target: { value: "Prueba" } });
    
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: "Aceptar" })); });

    expect(await screen.findByRole("alert")).toHaveTextContent("No tienes permisos para realizar esta acción.");
  });
});