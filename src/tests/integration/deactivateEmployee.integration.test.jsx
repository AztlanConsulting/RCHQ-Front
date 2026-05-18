import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useDeactivateEmployee } from "../../hooks/organism/useDeactivateEmployee";
import ReasonCard from "../../components/organism/reasonCard";
import { deactivateEmployeeService } from "../../services/deactivateEmployeeService";

// Secuestramos el servicio
vi.mock("../../services/deactivateEmployeeService", () => ({
  deactivateEmployeeService: vi.fn(),
}));

// Componente contenedor para probar la integración del Hook + UI
const TestIntegrationComponent = ({ employeeId, employeeName, setAlertMock }) => {
  const {
    isModalOpen,
    openModal,
    closeModal,
    reason,
    handleReasonChange,
    addToBlacklist,
    setAddToBlacklist,
    fieldError,
    isSubmitting,
    handleSubmit,
  } = useDeactivateEmployee(employeeId, employeeName, setAlertMock);

  return (
    <div>
      <button onClick={openModal}>Abrir Modal</button>
      <ReasonCard
        isOpen={isModalOpen}
        employeeName={employeeName}
        reason={reason}
        onReasonChange={handleReasonChange}
        addToBlacklist={addToBlacklist}
        onBlacklistChange={setAddToBlacklist}
        fieldError={fieldError}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        onCancel={closeModal}
      />
    </div>
  );
};

describe("Integración: Dar de baja a un empleado", () => {
  const setAlertMock = vi.fn();
  const employeeId = "123e4567-e89b-12d3-a456-426614174000";
  const employeeName = "María Gómez";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderAndOpenModal = async () => {
    render(
      <TestIntegrationComponent
        employeeId={employeeId}
        employeeName={employeeName}
        setAlertMock={setAlertMock}
      />
    );
    
    // Abrimos el modal
    fireEvent.click(screen.getByText("Abrir Modal"));
    
    // Asegurarnos que se abrió
    expect(await screen.findByText(/Estás a punto de dar de baja a "María Gómez"/i)).toBeInTheDocument();
  };

  it("permite enviar el formulario con la razón vacía delegando la validación al backend", async () => {
    deactivateEmployeeService.mockResolvedValueOnce({ success: true });
    await renderAndOpenModal();
    
    // Clic en enviar sin escribir razón
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Dar de baja" }));
    });

    // Al quitar la restricción min(1), el servicio se debe llamar correctamente
    expect(deactivateEmployeeService).toHaveBeenCalledWith(employeeId, "", false);
  });

  it("envía la petición correctamente sin activar lista negra", async () => {
    deactivateEmployeeService.mockResolvedValueOnce({ success: true });
    await renderAndOpenModal();

    // Llenamos la razón
    fireEvent.change(screen.getByPlaceholderText("Escribe la razón de la baja..."), {
      target: { value: "Término de contrato" },
    });

    // Enviamos
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Dar de baja" }));
    });

    // Verificamos que llamó al servicio correctamente
    expect(deactivateEmployeeService).toHaveBeenCalledWith(employeeId, "Término de contrato", false);
    
    // Verificamos que lanzó la alerta de éxito
    expect(setAlertMock).toHaveBeenCalledWith({
      type: "success",
      message: '"María Gómez" ha sido dado de baja.',
    });
  });

  it("envía la petición correctamente activando la lista negra", async () => {
    deactivateEmployeeService.mockResolvedValueOnce({ success: true });
    await renderAndOpenModal();

    fireEvent.change(screen.getByPlaceholderText("Escribe la razón de la baja..."), {
      target: { value: "Faltas graves" },
    });

    // Clickeamos el checkbox de lista negra
    fireEvent.click(screen.getByRole("checkbox"));

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Dar de baja" }));
    });

    expect(deactivateEmployeeService).toHaveBeenCalledWith(employeeId, "Faltas graves", true);
    expect(setAlertMock).toHaveBeenCalledWith({
      type: "success",
      message: '"María Gómez" ha sido dado de baja y agregado a la lista negra.',
    });
  });

  it("maneja correctamente un error del servicio (ej. API falla)", async () => {
    deactivateEmployeeService.mockRejectedValueOnce(new Error("No puedes darte de baja a ti mismo"));
    await renderAndOpenModal();

    fireEvent.change(screen.getByPlaceholderText("Escribe la razón de la baja..."), {
      target: { value: "Intento de auto-baja" },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Dar de baja" }));
    });

    expect(setAlertMock).toHaveBeenCalledWith({
      type: "error",
      message: "No puedes darte de baja a ti mismo",
    });
  });
});