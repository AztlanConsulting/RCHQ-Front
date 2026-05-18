import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ReasonCard from "../../components/organism/reasonCard";

describe("Prueba Unitaria: ReasonCard", () => {
  const defaultProps = {
    isOpen: true,
    employeeName: "Juan Pérez",
    reason: "",
    onReasonChange: vi.fn(),
    addToBlacklist: false,
    onBlacklistChange: vi.fn(),
    fieldError: null,
    isSubmitting: false,
    onSubmit: vi.fn(),
    onCancel: vi.fn(),
  };

  it("no renderiza nada si isOpen es falso", () => {
    const { container } = render(<ReasonCard {...defaultProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it("renderiza el modal con el nombre del empleado cuando isOpen es verdadero", () => {
    render(<ReasonCard {...defaultProps} />);
    expect(screen.getByText(/Estás a punto de dar de baja a "Juan Pérez"/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Escribe la razón de la baja...")).toBeInTheDocument();
  });

  it("llama a onReasonChange al escribir en el textarea", () => {
    render(<ReasonCard {...defaultProps} />);
    const textarea = screen.getByPlaceholderText("Escribe la razón de la baja...");
    
    fireEvent.change(textarea, { target: { value: "Nueva razón" } });
    
    expect(defaultProps.onReasonChange).toHaveBeenCalledWith("Nueva razón");
  });

  it("llama a onBlacklistChange al hacer clic en la opción de lista negra", () => {
    render(<ReasonCard {...defaultProps} />);
    const checkbox = screen.getByRole("checkbox");
    
    fireEvent.click(checkbox);
    
    expect(defaultProps.onBlacklistChange).toHaveBeenCalledWith(true);
  });

  it("muestra los errores de validación si existen", () => {
    render(<ReasonCard {...defaultProps} fieldError="La razón es obligatoria" />);
    expect(screen.getByText("La razón es obligatoria")).toBeInTheDocument();
    expect(screen.getByText("La razón es obligatoria")).toHaveClass("text-[#9b1c1c]");
  });

  it("llama a onSubmit al hacer clic en 'Dar de baja'", () => {
    render(<ReasonCard {...defaultProps} />);
    const btnSubmit = screen.getByRole("button", { name: "Dar de baja" });
    
    fireEvent.click(btnSubmit);
    
    expect(defaultProps.onSubmit).toHaveBeenCalled();
  });

  it("llama a onCancel al hacer clic en 'Cancelar'", () => {
    render(<ReasonCard {...defaultProps} />);
    const btnCancel = screen.getByRole("button", { name: "Cancelar" });
    
    fireEvent.click(btnCancel);
    
    expect(defaultProps.onCancel).toHaveBeenCalled();
  });

  it("deshabilita los inputs y botones si isSubmitting es verdadero", () => {
    render(<ReasonCard {...defaultProps} isSubmitting={true} />);
    
    const textarea = screen.getByPlaceholderText("Escribe la razón de la baja...");
    const btnSubmit = screen.getByRole("button", { name: "Procesando..." });
    const btnCancel = screen.getByRole("button", { name: "Cancelar" });
    const checkbox = screen.getByRole("checkbox");
    
    expect(textarea).toBeDisabled();
    expect(btnSubmit).toBeDisabled();
    expect(btnCancel).toBeDisabled();
    
    fireEvent.click(checkbox);
    expect(defaultProps.onBlacklistChange).not.toHaveBeenCalled();
  });
});