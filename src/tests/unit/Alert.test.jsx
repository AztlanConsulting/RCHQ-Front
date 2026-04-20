// tests/unit/Alert.test.jsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Alert from "../../Components/Atoms/Alerts";

describe("Alert — renderizado base", () => {
  it("renderiza el mensaje de texto en el DOM", () => {
    // Arrange
    const message = "Operación exitosa";

    // Act
    render(<Alert type="success" message={message} />);

    // Assert
    expect(screen.getByText("Operación exitosa")).toBeInTheDocument();
  });

  it("aplica la clase de fondo verde para el tipo success", () => {
    // Arrange & Act
    const { container } = render(<Alert type="success" message="OK" />);

    // Assert
    expect(container.firstChild).toHaveClass("bg-green-500");
  });

  it("aplica la clase de fondo rojo para el tipo error", () => {
    // Arrange & Act
    const { container } = render(<Alert type="error" message="Error" />);

    // Assert
    expect(container.firstChild).toHaveClass("bg-[#dd4344]");
  });

  it("aplica la clase de fondo amarillo para el tipo warning", () => {
    // Arrange & Act
    const { container } = render(<Alert type="warning" message="Advertencia" />);

    // Assert
    expect(container.firstChild).toHaveClass("bg-yellow-400");
  });

  it("aplica la clase de fondo azul para el tipo info", () => {
    // Arrange & Act
    const { container } = render(<Alert type="info" message="Información" />);

    // Assert
    expect(container.firstChild).toHaveClass("bg-blue-500");
  });

  it("renderiza un nodo React como mensaje", () => {
    // Arrange
    const message = (
      <ul>
        <li>Error 1</li>
        <li>Error 2</li>
      </ul>
    );

    // Act
    render(<Alert type="error" message={message} />);

    // Assert
    expect(screen.getByText("Error 1")).toBeInTheDocument();
    expect(screen.getByText("Error 2")).toBeInTheDocument();
  });

  it("muestra el ícono con alt igual al tipo del alert", () => {
    // Arrange & Act
    render(<Alert type="success" message="OK" />);

    // Assert
    expect(screen.getByAltText("success")).toBeInTheDocument();
  });

  it("no lanza errores cuando el tipo warning no tiene ícono asignado", () => {
    // Arrange & Act
    const { container } = render(<Alert type="warning" message="Advertencia" />);

    // Assert
    expect(container.firstChild).toBeInTheDocument();
  });
});