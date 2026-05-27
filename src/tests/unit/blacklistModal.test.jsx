import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import BlacklistModal from "../../components/molecules/blacklistModal";

describe("BlacklistModal", () => {
  const defaultProps = {
    isOpen: true,
    employeeName: "Juan Pérez",
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
    isSubmitting: false,
  };

  it("no renderiza nada si isOpen es falso", () => {
    render(<BlacklistModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByText(/Estás a punto de AGREGAR a la lista negra a/i)).not.toBeInTheDocument();
  });

  it("muestra el nombre del empleado y el textarea", () => {
    render(<BlacklistModal {...defaultProps} />);
    expect(screen.getByText(/Juan Pérez/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Escribe la razón para agregar/i)).toBeInTheDocument();
  });

  it("muestra error si se intenta confirmar sin escribir la razón", () => {
    render(<BlacklistModal {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: /Aceptar/i }));
    expect(screen.getByText("La razón es obligatoria")).toBeInTheDocument();
    expect(defaultProps.onConfirm).not.toHaveBeenCalled();
  });

  it("llama a onConfirm con la razón sanitizada y limpia", () => {
    render(<BlacklistModal {...defaultProps} />);
    const textarea = screen.getByPlaceholderText(/Escribe la razón para agregar/i);
    
    fireEvent.change(textarea, { target: { value: "Violación de políticas internas" } });
    fireEvent.click(screen.getByRole("button", { name: /Aceptar/i }));
    
    expect(defaultProps.onConfirm).toHaveBeenCalledWith("Violación de políticas internas");
  });

  it("llama a onCancel y limpia el formulario", () => {
    render(<BlacklistModal {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: /Cancelar/i }));
    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });

  it("deshabilita inputs y botones si isSubmitting es verdadero", () => {
    render(<BlacklistModal {...defaultProps} isSubmitting={true} />);
    const textarea = screen.getByPlaceholderText(/Escribe la razón para agregar/i);
    const acceptButton = screen.getByRole("button", { name: /Procesando/i });
    
    expect(textarea).toBeDisabled();
    expect(acceptButton).toBeDisabled();
  });

  it("usa el mismo estilo de cancelar que los demás modales de confirmación", () => {
    render(<BlacklistModal {...defaultProps} />);

    const cancelButton = screen.getByRole("button", { name: /Cancelar/i });
    expect(cancelButton).toHaveClass("border", "border-slate-200", "shadow-md");
  });
}); 
