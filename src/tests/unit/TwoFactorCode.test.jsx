// tests/unit/TwoFactorCode.test.jsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import TwoFactorCode from "../../Components/Organism/TwoFactorCode";

const makeProps = (overrides = {}) => ({
  code: "",
  setCode: vi.fn(),
  onSubmit: vi.fn(),
  loading: false,
  disabled: false,
  ...overrides,
});

describe("TwoFactorCode — renderizado", () => {
  it("muestra el input y el botón de verificar", () => {
    // Arrange & Act
    render(<TwoFactorCode {...makeProps()} />);

    // Assert
    expect(screen.getByPlaceholderText("Ingresa el código")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /verificar/i })).toBeInTheDocument();
  });

  it("muestra el código actual en el input", () => {
    // Arrange & Act
    render(<TwoFactorCode {...makeProps({ code: "123456" })} />);

    // Assert
    expect(screen.getByRole("textbox")).toHaveValue("123456");
  });

  it("muestra 'Verificando...' cuando loading=true", () => {
    // Arrange & Act
    render(<TwoFactorCode {...makeProps({ loading: true })} />);

    // Assert
    expect(screen.getByRole("button")).toHaveTextContent("Verificando...");
  });
});

describe("TwoFactorCode — estado del botón", () => {
  it("el botón está deshabilitado cuando loading=true", () => {
    // Arrange & Act
    render(<TwoFactorCode {...makeProps({ loading: true })} />);

    // Assert
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("el botón está deshabilitado cuando disabled=true", () => {
    // Arrange & Act
    render(<TwoFactorCode {...makeProps({ disabled: true })} />);

    // Assert
    expect(screen.getByRole("button")).toBeDisabled();
  });
});

describe("TwoFactorCode — interacción", () => {
  it("llama a onSubmit al hacer click en verificar", () => {
    // Arrange
    const onSubmit = vi.fn();
    render(<TwoFactorCode {...makeProps({ onSubmit })} />);

    // Act
    fireEvent.click(screen.getByRole("button"));

    // Assert
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("filtra caracteres no numéricos antes de llamar a setCode", () => {
    // Arrange
    const setCode = vi.fn();
    render(<TwoFactorCode {...makeProps({ setCode })} />);

    // Act
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "abc123" },
    });

    // Assert
    expect(setCode).toHaveBeenCalledWith("123");
  });

  it("trunca el valor a 6 dígitos antes de llamar a setCode", () => {
    // Arrange
    const setCode = vi.fn();
    render(<TwoFactorCode {...makeProps({ setCode })} />);

    // Act
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "1234567" },
    });

    // Assert
    expect(setCode).toHaveBeenCalledWith("123456");
  });
});