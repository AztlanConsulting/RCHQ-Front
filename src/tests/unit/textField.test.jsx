import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import TextField from "../../components/atoms/textField";

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
    const props = makeProps({ text: "Correo electrónico" });

    render(<TextField {...props} />);

    expect(screen.getByText("Correo electrónico")).toBeInTheDocument();
  });

  it("muestra el placeholder en el input", () => {
    const props = makeProps({ placeholder: "Escribe tu email" });

    render(<TextField {...props} />);

    expect(screen.getByPlaceholderText("Escribe tu email")).toBeInTheDocument();
  });

  it("muestra el valor actual pasado por props", () => {
    const props = makeProps({ value: "valor actual" });

    render(<TextField {...props} />);

    expect(screen.getByRole("textbox")).toHaveValue("valor actual");
  });

  it("el label está asociado al input mediante htmlFor/id", () => {
    const props = makeProps({ id: "email", htmlFor: "email", text: "Email" });

    render(<TextField {...props} />);

    expect(screen.getByText("Email")).toHaveAttribute("for", "email");
  });

  it("aplica el atributo maxLength al input", () => {
    const props = makeProps({ maxLength: 10 });

    render(<TextField {...props} />);

    expect(screen.getByRole("textbox")).toHaveAttribute("maxLength", "10");
  });
});

describe("TextField — interacción del usuario", () => {
  it("llama a setValue con el nuevo valor cuando el usuario escribe", () => {
    const setValue = vi.fn();
    render(<TextField {...makeProps({ setValue })} />);

    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "hola" },
    });

    expect(setValue).toHaveBeenCalledWith("hola");
  });

  it("enfoca el input al hacer click en el contenedor", () => {
    render(<TextField {...makeProps()} />);
    const input = screen.getByRole("textbox");
    const container = input.closest("div");

    fireEvent.click(container);

    expect(document.activeElement).toBe(input);
  });
});

describe("TextField — ícono derecho", () => {
  it("muestra el botón del ícono cuando se proporciona onIconRightClick", () => {
    const props = makeProps({
      iconRight: "/eye.svg",
      iconRightAlt: "Mostrar",
      iconRightAriaLabel: "Mostrar contraseña",
      onIconRightClick: vi.fn(),
    });

    render(<TextField {...props} />);

    expect(
      screen.getByRole("button", { name: "Mostrar contraseña" }),
    ).toBeInTheDocument();
  });

  it("llama a onIconRightClick al hacer click en el botón del ícono", () => {
    const handleClick = vi.fn();
    render(
      <TextField
        {...makeProps({
          iconRight: "/eye.svg",
          iconRightAriaLabel: "Mostrar contraseña",
          onIconRightClick: handleClick,
        })}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Mostrar contraseña" }));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("renderiza el ícono como img cuando iconRight es un string de ruta", () => {
    const props = makeProps({
      iconRight: "/eye.svg",
      iconRightAlt: "ojo",
      onIconRightClick: vi.fn(),
    });

    render(<TextField {...props} />);

    expect(screen.getByAltText("ojo")).toBeInTheDocument();
  });

  it("renderiza el ícono sin botón cuando no se proporciona onIconRightClick", () => {
    const icon = <svg data-testid="static-icon" />;
    const props = makeProps({ iconRight: icon });

    render(<TextField {...props} />);

    expect(screen.getByTestId("static-icon")).toBeInTheDocument();
    expect(screen.queryByRole("button")).toBeNull();
  });
});

describe("TextField — tipo de input", () => {
  it("usa type=text por defecto", () => {
    render(<TextField {...makeProps()} />);

    expect(screen.getByRole("textbox")).toHaveAttribute("type", "text");
  });

  it("aplica type=password cuando se indica", () => {
    render(<TextField {...makeProps({ type: "password" })} />);

    expect(
      document.querySelector("input[type='password']"),
    ).toBeInTheDocument();
  });

  it("aplica type=email cuando se indica", () => {
    render(<TextField {...makeProps({ type: "email" })} />);

    expect(document.querySelector("input[type='email']")).toBeInTheDocument();
  });
});
