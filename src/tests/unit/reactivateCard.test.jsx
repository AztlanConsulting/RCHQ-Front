import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ReactivateCard from "../../components/organism/reactivateCard";

describe("Prueba Unitaria: ReactivateCard", () => {
  const defaultProps = {
    isOpen: true,
    employee: null,
    employeeName: undefined,
    isSubmitting: false,
    onSubmit: vi.fn(),
    onCancel: vi.fn(),
  };

  it("no renderiza nada si isOpen es falso", () => {
    const { container } = render(<ReactivateCard {...defaultProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it("renderiza el modal con employeeName cuando isOpen es verdadero", () => {
    render(
      <ReactivateCard {...defaultProps} employeeName="Ana López" />,
    );
    expect(
      screen.getByText((content) => content.includes("¿Reactivar a") && content.includes("Ana López")),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/El empleado volverá a estar activo en el sistema/i),
    ).toBeInTheDocument();
  });

  it("prioriza employeeName sobre los datos del objeto employee", () => {
    render(
      <ReactivateCard
        {...defaultProps}
        employeeName="Nombre explícito"
        employee={{ name: "Otro", surname: "Apellido" }}
      />,
    );
    expect(screen.getByText(/Nombre explícito/)).toBeInTheDocument();
    expect(screen.queryByText(/Otro/)).not.toBeInTheDocument();
  });

  it("resuelve el nombre desde employee (name + surname)", () => {
    render(
      <ReactivateCard
        {...defaultProps}
        employee={{ name: "Carlos", surname: "Ramírez" }}
      />,
    );
    expect(screen.getByText(/Carlos Ramírez/)).toBeInTheDocument();
  });

  it("usa lastName como respaldo si no hay surname", () => {
    render(
      <ReactivateCard
        {...defaultProps}
        employee={{ name: "Luis", lastName: "Martínez" }}
      />,
    );
    expect(screen.getByText(/Luis Martínez/)).toBeInTheDocument();
  });

  it('muestra "este empleado" cuando no hay nombre disponible', () => {
    render(<ReactivateCard {...defaultProps} employee={{}} />);
    expect(screen.getByText(/¿Reactivar a "este empleado"\?/)).toBeInTheDocument();
  });

  it("expone role=dialog con nombre accesible", () => {
    render(<ReactivateCard {...defaultProps} employeeName="Test" />);
    expect(
      screen.getByRole("dialog", { name: /¿Reactivar a "Test"\?/ }),
    ).toBeInTheDocument();
  });

  it("llama a onSubmit al hacer clic en Reactivar", () => {
    render(<ReactivateCard {...defaultProps} employeeName="X" />);
    fireEvent.click(screen.getByRole("button", { name: "Reactivar" }));
    expect(defaultProps.onSubmit).toHaveBeenCalled();
  });

  it("llama a onCancel al hacer clic en Cancelar", () => {
    render(<ReactivateCard {...defaultProps} employeeName="X" />);
    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(defaultProps.onCancel).toHaveBeenCalled();
  });

  it("deshabilita botones y muestra Procesando... si isSubmitting es verdadero", () => {
    render(<ReactivateCard {...defaultProps} employeeName="X" isSubmitting />);
    expect(screen.getByRole("button", { name: "Procesando..." })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeDisabled();
  });
});
