// tests/unit/TextField.test.jsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import TextField from "../../Components/Atoms/TextField";

const makeProps = (overrides = {}) => ({
  id: "test-input",
  value: "",
  setValue: vi.fn(),
  placeholder: "Escribe aquí",
  text: "Mi campo",
  htmlFor: "test-input",
  ...overrides,
});

describe("TextField — renderizado base", () => {
  it("muestra el label con el texto recibido", () => {
    // Arrange
    const props = makeProps({ text: "Correo electrónico" });

    // Act
    render(<TextField {...props} />);

    // Assert
    expect(screen.getByText("Correo electrónico")).toBeInTheDocument();
  });

  it("muestra el placeholder en el input", () => {
    // Arrange
    const props = makeProps({ placeholder: "Escribe tu email" });

    // Act
    render(<TextField {...props} />);

    // Assert
    expect(screen.getByPlaceholderText("Escribe tu email")).toBeInTheDocument();
  });

  it("muestra el valor actual pasado por props", () => {
    // Arrange
    const props = makeProps({ value: "valor actual" });

    // Act
    render(<TextField {...props} />);

    // Assert
    expect(screen.getByRole("textbox")).toHaveValue("valor actual");
  });

  it("el label está asociado al input mediante htmlFor/id", () => {
    // Arrange
    const props = makeProps({ id: "email", htmlFor: "email", text: "Email" });

    // Act
    render(<TextField {...props} />);

    // Assert
    expect(screen.getByText("Email")).toHaveAttribute("for", "email");
  });

  it("aplica el atributo maxLength al input", () => {
    // Arrange
    const props = makeProps({ maxLength: 10 });

    // Act
    render(<TextField {...props} />);

    // Assert
    expect(screen.getByRole("textbox")).toHaveAttribute("maxLength", "10");
  });
});

describe("TextField — interacción del usuario", () => {
  it("llama a setValue con el nuevo valor cuando el usuario escribe", () => {
    // Arrange
    const setValue = vi.fn();
    render(<TextField {...makeProps({ setValue })} />);

    // Act
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "hola" } });

    // Assert
    expect(setValue).toHaveBeenCalledWith("hola");
  });
});

describe("TextField — ícono derecho", () => {
  it("muestra el botón del ícono cuando se proporciona onIconRightClick", () => {
    // Arrange
    const props = makeProps({
      iconRight: "/eye.svg",
      iconRightAlt: "Mostrar",
      iconRightAriaLabel: "Mostrar contraseña",
      onIconRightClick: vi.fn(),
    });

    // Act
    render(<TextField {...props} />);

    // Assert
    expect(
      screen.getByRole("button", { name: "Mostrar contraseña" })
    ).toBeInTheDocument();
  });

  it("llama a onIconRightClick al hacer click en el botón del ícono", () => {
    // Arrange
    const handleClick = vi.fn();
    render(
      <TextField
        {...makeProps({
          iconRight: "/eye.svg",
          iconRightAriaLabel: "Mostrar contraseña",
          onIconRightClick: handleClick,
        })}
      />
    );

    // Act
    fireEvent.click(screen.getByRole("button", { name: "Mostrar contraseña" }));

    // Assert
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("renderiza el ícono como img cuando es un string de ruta", () => {
    // Arrange
    const props = makeProps({
      iconRight: "/eye.svg",
      iconRightAlt: "ojo",
      onIconRightClick: vi.fn(),
    });

    // Act
    render(<TextField {...props} />);

    // Assert
    expect(screen.getByAltText("ojo")).toBeInTheDocument();
  });
});

describe("TextField — tipo de input", () => {
  it("usa type=text por defecto", () => {
    // Arrange & Act
    render(<TextField {...makeProps()} />);

    // Assert
    expect(screen.getByRole("textbox")).toHaveAttribute("type", "text");
  });

  it("aplica type=password cuando se indica", () => {
    // Arrange & Act
    render(<TextField {...makeProps({ type: "password" })} />);

    // Assert
    expect(
      document.querySelector("input[type='password']")
    ).toBeInTheDocument();
  });

  it("aplica type=email cuando se indica", () => {
    // Arrange & Act
    render(<TextField {...makeProps({ type: "email" })} />);

    // Assert
    expect(
      document.querySelector("input[type='email']")
    ).toBeInTheDocument();
  });
});