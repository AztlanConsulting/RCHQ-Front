import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useReactivateEmployee } from "@/hooks/organism/useReactivateEmployee";
import ReactivateCard from "../../components/organism/reactivateCard";
import { reactivateEmployeeService } from "@/services/reactivateEmployeeService";

vi.mock("@/services/reactivateEmployeeService", () => ({
  reactivateEmployeeService: vi.fn(),
}));

const TestIntegrationComponent = ({
  employeeId,
  employeeName,
  setAlertMock,
  employeeIsActiveInDb = false,
  onSuccessMock,
}) => {
  const {
    isReactivateModalOpen,
    openReactivateModal,
    closeReactivateModal,
    isSubmittingReactivate,
    handleSubmitReactivate,
  } = useReactivateEmployee(
    employeeId,
    employeeName,
    setAlertMock,
    employeeIsActiveInDb,
    onSuccessMock,
  );

  return (
    <div>
      <button type="button" onClick={openReactivateModal}>
        Abrir reactivación
      </button>
      <ReactivateCard
        isOpen={isReactivateModalOpen}
        employeeName={employeeName}
        isSubmitting={isSubmittingReactivate}
        onSubmit={handleSubmitReactivate}
        onCancel={closeReactivateModal}
      />
    </div>
  );
};

describe("Integración: Reactivar empleado", () => {
  const setAlertMock = vi.fn();
  const employeeId = "123e4567-e89b-12d3-a456-426614174000";
  const employeeName = "María Gómez";
  const onSuccessMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("no abre el modal y muestra alerta si el empleado sigue activo", () => {
    render(
      <TestIntegrationComponent
        employeeId={employeeId}
        employeeName={employeeName}
        setAlertMock={setAlertMock}
        employeeIsActiveInDb={true}
      />,
    );

    fireEvent.click(screen.getByText("Abrir reactivación"));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(setAlertMock).toHaveBeenCalledWith({
      type: "error",
      message: "El empleado ya ha sido reactivado previamente.",
    });
    expect(reactivateEmployeeService).not.toHaveBeenCalled();
  });

  it("abre el modal y envía PATCH vía servicio cuando el empleado está inactivo", async () => {
    reactivateEmployeeService.mockResolvedValueOnce({ ok: true });

    render(
      <TestIntegrationComponent
        employeeId={employeeId}
        employeeName={employeeName}
        setAlertMock={setAlertMock}
        employeeIsActiveInDb={false}
        onSuccessMock={onSuccessMock}
      />,
    );

    fireEvent.click(screen.getByText("Abrir reactivación"));

    expect(
      await screen.findByRole("dialog", { name: /¿Reactivar a .*María Gómez/ }),
    ).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Reactivar" }));
    });

    expect(reactivateEmployeeService).toHaveBeenCalledWith(employeeId);
    expect(setAlertMock).toHaveBeenCalledWith({
      type: "success",
      message: `"${employeeName}" ha sido reactivado`,
    });
    expect(onSuccessMock).toHaveBeenCalled();
  });

  it("maneja error del API y cierra el modal", async () => {
    reactivateEmployeeService.mockRejectedValueOnce(
      new Error("El empleado se encuentra en la lista negra"),
    );

    render(
      <TestIntegrationComponent
        employeeId={employeeId}
        employeeName={employeeName}
        setAlertMock={setAlertMock}
        employeeIsActiveInDb={false}
      />,
    );

    fireEvent.click(screen.getByText("Abrir reactivación"));
    await screen.findByRole("dialog");

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Reactivar" }));
    });

    expect(setAlertMock).toHaveBeenCalledWith({
      type: "error",
      message: "El empleado se encuentra en la lista negra",
    });
  });

  it("cierra el modal con Cancelar sin llamar al servicio", async () => {
    render(
      <TestIntegrationComponent
        employeeId={employeeId}
        employeeName={employeeName}
        setAlertMock={setAlertMock}
        employeeIsActiveInDb={false}
      />,
    );

    fireEvent.click(screen.getByText("Abrir reactivación"));
    await screen.findByRole("dialog");

    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(reactivateEmployeeService).not.toHaveBeenCalled();
  });
});
