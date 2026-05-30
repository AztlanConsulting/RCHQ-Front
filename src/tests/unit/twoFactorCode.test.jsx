import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import TwoFactorCode from "../../components/organism/twoFactorCode";

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
    render(<TwoFactorCode {...makeProps()} />);

    expect(
      screen.getByPlaceholderText("Ingresa el código"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /verificar/i }),
    ).toBeInTheDocument();
  });

  it("muestra el código actual en el input", () => {
    render(<TwoFactorCode {...makeProps({ code: "123456" })} />);

    expect(screen.getByRole("textbox")).toHaveValue("123456");
  });

  it("muestra 'Verificando...' cuando loading=true", () => {
    render(<TwoFactorCode {...makeProps({ loading: true })} />);

    expect(screen.getByRole("button")).toHaveTextContent("Verificando...");
  });
});

describe("TwoFactorCode — estado del botón", () => {
  it("el botón está deshabilitado cuando loading=true", () => {
    render(<TwoFactorCode {...makeProps({ loading: true })} />);

    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("el botón está deshabilitado cuando disabled=true", () => {
    render(<TwoFactorCode {...makeProps({ disabled: true })} />);

    expect(screen.getByRole("button")).toBeDisabled();
  });
});

describe("TwoFactorCode — interacción", () => {
  it("llama a onSubmit al hacer click en verificar", () => {
    const onSubmit = vi.fn();
    render(<TwoFactorCode {...makeProps({ onSubmit })} />);

    fireEvent.click(screen.getByRole("button"));

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("filtra caracteres no numéricos antes de llamar a setCode", () => {
    const setCode = vi.fn();
    render(<TwoFactorCode {...makeProps({ setCode })} />);

    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "abc123" },
    });

    expect(setCode).toHaveBeenCalledWith("123");
  });

  it("trunca el valor a 6 dígitos antes de llamar a setCode", () => {
    const setCode = vi.fn();
    render(<TwoFactorCode {...makeProps({ setCode })} />);

    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "1234567" },
    });

    expect(setCode).toHaveBeenCalledWith("123456");
  });
});
