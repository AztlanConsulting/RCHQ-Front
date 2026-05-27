import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Button from "../../components/atoms/button";

const makeProps = (overrides = {}) => ({
  text: "Haz click",
  onClick: vi.fn(),
  ...overrides,
});

describe("Button — renderizado base", () => {
  it("muestra el texto recibido por la prop 'text'", () => {
    const props = makeProps({ text: "Guardar Cambios" });

    render(<Button {...props} />);
    const button = screen.getByRole("button", { name: "Guardar Cambios" });

    expect(button).toBeInTheDocument();
  });

  it("renderiza como type='button' por defecto", () => {
    const props = makeProps();

    render(<Button {...props} />);
    const button = screen.getByRole("button");

    expect(button).toHaveAttribute("type", "button");
  });

  it("aplica un type personalizado cuando se le pasa (ej. 'submit')", () => {
    const props = makeProps({ type: "submit", text: "Enviar" });

    render(<Button {...props} />);
    const button = screen.getByRole("button", { name: "Enviar" });

    expect(button).toHaveAttribute("type", "submit");
  });
});

describe("Button — interacción del usuario", () => {
  it("ejecuta la función onClick cuando el usuario hace click", () => {
    const onClickMock = vi.fn();
    const props = makeProps({ onClick: onClickMock, text: "Aceptar" });
    render(<Button {...props} />);
    const button = screen.getByRole("button", { name: "Aceptar" });

    fireEvent.click(button);

    expect(onClickMock).toHaveBeenCalledTimes(1);
  });
});

describe("Button — estados y estilos", () => {
  it("deshabilita el botón y no ejecuta onClick cuando disabled es true", () => {
    const onClickMock = vi.fn();
    const props = makeProps({
      onClick: onClickMock,
      disabled: true,
      text: "No click",
    });
    render(<Button {...props} />);
    const button = screen.getByRole("button", { name: "No click" });

    fireEvent.click(button);

    expect(button).toBeDisabled();
    expect(onClickMock).not.toHaveBeenCalled();
  });

  it("aplica las clases de Tailwind por defecto tanto en el botón como en el texto", () => {
    const props = makeProps({ text: "Default" });

    render(<Button {...props} />);
    const button = screen.getByRole("button");
    const textSpan = screen.getByText("Default");

    expect(button).toHaveClass("bg-neutral-50");
    expect(button).toHaveClass("w-[206px]");
    expect(button).toHaveClass("h-[50px]");
    expect(textSpan).toHaveClass("text-[#121212]");
    expect(textSpan).toHaveClass("text-xl");
    expect(textSpan).toHaveClass("font-bold");
  });

  it("sobrescribe las clases por defecto con las proporcionadas y agrega className extra", () => {
    const props = makeProps({
      bgColor: "bg-red-500",
      textColor: "text-white",
      width: "w-full",
      className: "clase-personalizada",
      text: "Botón Rojo",
    });

    render(<Button {...props} />);
    const button = screen.getByRole("button");
    const textSpan = screen.getByText("Botón Rojo");

    expect(button).toHaveClass("bg-red-500");
    expect(button).toHaveClass("w-full");
    expect(button).toHaveClass("clase-personalizada");
    expect(textSpan).toHaveClass("text-white");
  });
});

describe("Button — contenido condicional (iconos y children)", () => {
  it("renderiza un ícono junto al texto si se proporciona la prop 'icon'", () => {
    const FakeIcon = <svg data-testid="test-icon"></svg>;
    const props = makeProps({ text: "Descargar", icon: FakeIcon });

    render(<Button {...props} />);

    expect(screen.getByText("Descargar")).toBeInTheDocument();
    expect(screen.getByTestId("test-icon")).toBeInTheDocument();
  });

  it("ignora 'text' e 'icon' y renderiza exclusivamente los 'children' si se proporcionan", () => {
    const FakeIcon = <svg data-testid="test-icon"></svg>;
    const props = makeProps({ text: "Texto ignorado", icon: FakeIcon });

    render(
      <Button {...props}>
        <div data-testid="custom-child">Contenido Especial</div>
      </Button>,
    );

    expect(screen.getByTestId("custom-child")).toBeInTheDocument();
    expect(screen.getByText("Contenido Especial")).toBeInTheDocument();
    expect(screen.queryByText("Texto ignorado")).not.toBeInTheDocument();
    expect(screen.queryByTestId("test-icon")).not.toBeInTheDocument();
  });
});
