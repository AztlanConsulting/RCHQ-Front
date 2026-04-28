import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Forms from "../../Components/Organism/Forms";

const mockFields = [
  {
    id: "email",
    htmlFor: "email",
    value: "",
    setValue: vi.fn(),
    placeholder: "Correo electrónico",
    type: "text",
  },
  {
    id: "password",
    htmlFor: "password",
    value: "",
    setValue: vi.fn(),
    placeholder: "Contraseña",
    type: "password",
  },
];

const mockActions = [
  {
    id: "submit",
    text: "Iniciar sesión",
    type: "submit",
    bgColor: "bg-blue-600",
    textColor: "text-white",
    hoverColor: "hover:bg-blue-700",
    activeColor: "active:bg-blue-800",
  },
];

describe("Forms — renderizado", () => {
  it("muestra el título cuando se proporciona", () => {
    render(
      <Forms title="Bienvenido" fields={[]} actions={[]} onSubmit={() => {}} />,
    );
    expect(screen.getByText("Bienvenido")).toBeInTheDocument();
  });

  it("no muestra título cuando no se proporciona", () => {
    render(<Forms fields={[]} actions={[]} onSubmit={() => {}} />);
    expect(screen.queryByRole("heading")).toBeNull();
  });

  it("muestra la descripción cuando se proporciona", () => {
    render(
      <Forms
        description="Ingresa tus datos"
        fields={[]}
        actions={[]}
        onSubmit={() => {}}
      />,
    );
    expect(screen.getByText("Ingresa tus datos")).toBeInTheDocument();
  });

  it("renderiza los campos correctamente", () => {
    render(<Forms fields={mockFields} actions={[]} onSubmit={() => {}} />);
    expect(
      screen.getByPlaceholderText("Correo electrónico"),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Contraseña")).toBeInTheDocument();
  });

  it("renderiza los botones de acción", () => {
    render(<Forms fields={[]} actions={mockActions} onSubmit={() => {}} />);
    expect(
      screen.getByRole("button", { name: "Iniciar sesión" }),
    ).toBeInTheDocument();
  });

  it("renderiza el footer cuando se proporciona", () => {
    render(
      <Forms
        fields={[]}
        actions={[]}
        onSubmit={() => {}}
        footer={<p>¿Olvidaste tu contraseña?</p>}
      />,
    );
    expect(screen.getByText("¿Olvidaste tu contraseña?")).toBeInTheDocument();
  });
});

describe("Forms — interacción", () => {
  it("llama a onSubmit al hacer submit del formulario", () => {
    const handleSubmit = vi.fn();
    render(<Forms fields={[]} actions={mockActions} onSubmit={handleSubmit} />);
    fireEvent.click(screen.getByRole("button", { name: "Iniciar sesión" }));
    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });

  it("no llama a onSubmit cuando el botón está deshabilitado", () => {
    const handleSubmit = vi.fn();
    const disabledActions = [{ ...mockActions[0], disabled: true }];
    render(
      <Forms fields={[]} actions={disabledActions} onSubmit={handleSubmit} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Iniciar sesión" }));
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it("previene el comportamiento por defecto del form al hacer submit", () => {
    const handleSubmit = vi.fn();
    render(<Forms fields={[]} actions={mockActions} onSubmit={handleSubmit} />);
    const form = screen
      .getByRole("button", { name: "Iniciar sesión" })
      .closest("form");
    const submitEvent = new Event("submit", {
      bubbles: true,
      cancelable: true,
    });
    form.dispatchEvent(submitEvent);
    expect(submitEvent.defaultPrevented).toBe(true);
  });
});
