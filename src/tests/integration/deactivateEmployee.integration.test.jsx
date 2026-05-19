import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useDeactivateEmployee } from "../../hooks/organism/useDeactivateEmployee";
import ReasonCard from "../../components/organism/reasonCard";
import { deactivateEmployeeService } from "../../services/deactivateEmployeeService";

vi.mock("../../services/deactivateEmployeeService", () => ({
  deactivateEmployeeService: vi.fn(),
}));

const TestIntegrationComponent = ({ employeeId, employeeName, setAlertMock, isActive = true, onSuccessMock }) => {
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
  } = useDeactivateEmployee(employeeId, employeeName, setAlertMock, isActive, onSuccessMock);

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
  const onSuccessMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderAndOpenModal = async () => {
    render(
      <TestIntegrationComponent
        employeeId={employeeId}
        employeeName={employeeName}
        setAlertMock={setAlertMock}
        onSuccessMock={onSuccessMock}
      />
    );
    
    fireEvent.click(screen.getByText("Abrir Modal"));
    
    expect(await screen.findByText(/Estás a punto de dar de baja a "María Gómez"/i)).toBeInTheDocument();
  };

  it("valida que la razón no esté vacía si el empleado está activo", async () => {
    await renderAndOpenModal();
    
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Dar de baja" }));
    });

    expect(await screen.findByText('El campo "Razón" es obligatorio.')).toBeInTheDocument();
    expect(deactivateEmployeeService).not.toHaveBeenCalled();
  });

  it("no abre el modal y muestra alerta si el empleado ya está inactivo", async () => {
    render(
      <TestIntegrationComponent
        employeeId={employeeId}
        employeeName={employeeName}
        setAlertMock={setAlertMock}
        isActive={false}
      />
    );

    fireEvent.click(screen.getByText("Abrir Modal"));

    expect(screen.queryByText(/Estás a punto de dar de baja a/i)).not.toBeInTheDocument();
    expect(setAlertMock).toHaveBeenCalledWith({
      type: "error",
      message: "El empleado ya ha sido dado de baja previamente.",
    });
  });

  it("envía la petición correctamente sin activar lista negra", async () => {
    deactivateEmployeeService.mockResolvedValueOnce({ success: true });
    await renderAndOpenModal();

    fireEvent.change(screen.getByPlaceholderText("Escribe la razón de la baja..."), {
      target: { value: "Término de contrato" },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Dar de baja" }));
    });

    expect(deactivateEmployeeService).toHaveBeenCalledWith(employeeId, "Término de contrato", false);
    
    expect(setAlertMock).toHaveBeenCalledWith({
      type: "success",
      message: '"María Gómez" ha sido dado de baja.',
    });
    expect(onSuccessMock).toHaveBeenCalled();
  });

  it("envía la petición correctamente activando la lista negra", async () => {
    deactivateEmployeeService.mockResolvedValueOnce({ success: true });
    await renderAndOpenModal();

    fireEvent.change(screen.getByPlaceholderText("Escribe la razón de la baja..."), {
      target: { value: "Faltas graves" },
    });

    fireEvent.click(screen.getByRole("checkbox"));

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Dar de baja" }));
    });

    expect(deactivateEmployeeService).toHaveBeenCalledWith(employeeId, "Faltas graves", true);
    expect(setAlertMock).toHaveBeenCalledWith({
      type: "success",
      message: '"María Gómez" ha sido dado de baja y agregado a la lista negra.',
    });
    expect(onSuccessMock).toHaveBeenCalled();
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