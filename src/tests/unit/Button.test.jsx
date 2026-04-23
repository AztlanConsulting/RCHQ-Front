// tests/unit/Button.test.jsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Button from "../../Components/Atoms/Button";

const makeProps = (overrides = {}) => ({
    text: "Haz click",
    onClick: vi.fn(),
    ...overrides,
});

describe("Button — renderizado base", () => {
    it("muestra el texto recibido por la prop 'text'", () => {
        // Arrange
        const props = makeProps({ text: "Guardar Cambios" });

        // Act
        render(<Button {...props} />);
        const button = screen.getByRole("button", { name: "Guardar Cambios" });

        // Assert
        expect(button).toBeInTheDocument();
    });

    it("renderiza como type='button' por defecto", () => {
        // Arrange
        const props = makeProps();

        // Act
        render(<Button {...props} />);
        const button = screen.getByRole("button");

        // Assert
        expect(button).toHaveAttribute("type", "button");
    });

    it("aplica un type personalizado cuando se le pasa (ej. 'submit')", () => {
        // Arrange
        const props = makeProps({ type: "submit", text: "Enviar" });

        // Act
        render(<Button {...props} />);
        const button = screen.getByRole("button", { name: "Enviar" });

        // Assert
        expect(button).toHaveAttribute("type", "submit");
    });
});

describe("Button — interacción del usuario", () => {
    it("ejecuta la función onClick cuando el usuario hace click", () => {
        // Arrange
        const onClickMock = vi.fn();
        const props = makeProps({ onClick: onClickMock, text: "Aceptar" });
        render(<Button {...props} />);
        const button = screen.getByRole("button", { name: "Aceptar" });

        // Act
        fireEvent.click(button);

        // Assert
        expect(onClickMock).toHaveBeenCalledTimes(1);
    });
});

describe("Button — estados y estilos", () => {
    it("deshabilita el botón y no ejecuta onClick cuando disabled es true", () => {
        // Arrange
        const onClickMock = vi.fn();
        const props = makeProps({
            onClick: onClickMock,
            disabled: true,
            text: "No click",
        });
        render(<Button {...props} />);
        const button = screen.getByRole("button", { name: "No click" });

        // Act
        fireEvent.click(button);

        // Assert
        expect(button).toBeDisabled();
        expect(onClickMock).not.toHaveBeenCalled();
    });

    it("aplica las clases de Tailwind por defecto tanto en el botón como en el texto", () => {
        // Arrange
        const props = makeProps({ text: "Default" });

        // Act
        render(<Button {...props} />);
        const button = screen.getByRole("button");
        const textSpan = screen.getByText("Default");

        // Assert
        expect(button).toHaveClass("bg-neutral-50");
        expect(button).toHaveClass("w-[206px]");
        expect(button).toHaveClass("h-[50px]");
        expect(textSpan).toHaveClass("text-[#121212]");
        expect(textSpan).toHaveClass("text-xl");
        expect(textSpan).toHaveClass("font-bold");
    });

    it("sobrescribe las clases por defecto con las proporcionadas y agrega className extra", () => {
        // Arrange
        const props = makeProps({
            bgColor: "bg-red-500",
            textColor: "text-white",
            width: "w-full",
            className: "clase-personalizada",
            text: "Botón Rojo",
        });

        // Act
        render(<Button {...props} />);
        const button = screen.getByRole("button");
        const textSpan = screen.getByText("Botón Rojo");

        // Assert
        expect(button).toHaveClass("bg-red-500");
        expect(button).toHaveClass("w-full");
        expect(button).toHaveClass("clase-personalizada");
        expect(textSpan).toHaveClass("text-white");
    });
});

describe("Button — contenido condicional (iconos y children)", () => {
    it("renderiza un ícono junto al texto si se proporciona la prop 'icon'", () => {
        // Arrange
        const FakeIcon = <svg data-testid="test-icon"></svg>;
        const props = makeProps({ text: "Descargar", icon: FakeIcon });

        // Act
        render(<Button {...props} />);

        // Assert
        expect(screen.getByText("Descargar")).toBeInTheDocument();
        expect(screen.getByTestId("test-icon")).toBeInTheDocument();
    });

    it("ignora 'text' e 'icon' y renderiza exclusivamente los 'children' si se proporcionan", () => {
        // Arrange
        const FakeIcon = <svg data-testid="test-icon"></svg>;
        const props = makeProps({ text: "Texto ignorado", icon: FakeIcon });

        // Act
        render(
            <Button {...props}>
                <div data-testid="custom-child">Contenido Especial</div>
            </Button>,
        );

        // Assert
        expect(screen.getByTestId("custom-child")).toBeInTheDocument();
        expect(screen.getByText("Contenido Especial")).toBeInTheDocument();
        expect(screen.queryByText("Texto ignorado")).not.toBeInTheDocument();
        expect(screen.queryByTestId("test-icon")).not.toBeInTheDocument();
    });
});
