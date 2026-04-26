// tests/unit/SelectField.test.jsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import SelectField from "../../Components/Atoms/SelectField";

const ROLES = {
  COORDINADOR: "a0000002-0000-4000-8000-000000000001",
  ADMINISTRADOR: "a0000002-0000-4000-8000-000000000002",
  MANTENIMIENTO: "a0000002-0000-4000-8000-000000000003",
  LAVANDERIA: "a0000002-0000-4000-8000-000000000004",
};

const makeProps = (overrides = {}) => ({
  label: "Rol del empleado",
  name: "role",
  value: "",
  onChange: vi.fn(),
  options: [
    { value: ROLES.COORDINADOR, label: "Coordinador" },
    { value: ROLES.ADMINISTRADOR, label: "Administrador" },
    { value: ROLES.MANTENIMIENTO, label: "Mantenimiento" },
    { value: ROLES.LAVANDERIA, label: "Lavandería" },
  ],
  placeholder: "Selecciona una opción",
  ...overrides,
});

describe("SelectField — renderizado base", () => {
  it("muestra el label con el texto recibido", () => {
    // Arrange
    const props = makeProps({ label: "Puesto de trabajo" });

    // Act
    render(<SelectField {...props} />);

    // Assert
    expect(screen.getByText("Puesto de trabajo")).toBeInTheDocument();
  });

  it("muestra el asterisco cuando el campo es obligatorio", () => {
    // Arrange
    const props = makeProps({ required: true });

    // Act
    render(<SelectField {...props} />);

    // Assert
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("renderiza todos los roles disponibles y el placeholder", () => {
    // Arrange
    const props = makeProps();

    // Act
    render(<SelectField {...props} />);
    const options = screen.getAllByRole("option", { hidden: true });

    // Assert
    expect(options).toHaveLength(5);
    expect(screen.getByText("Coordinador")).toBeInTheDocument();
  });

  it("configura el placeholder correctamente como opción deshabilitada", () => {
    // Arrange
    const props = makeProps({ placeholder: "Elegir cargo..." });

    // Act
    render(<SelectField {...props} />);
    const placeholder = screen.getByText("Elegir cargo...", {
      hidden: true,
    });

    // Assert
    expect(placeholder).toBeDisabled();
    expect(placeholder).toHaveAttribute("hidden");
    expect(placeholder).toHaveValue("");
  });

  it("vincula el label con el select mediante el ID", () => {
    // Arrange
    const props = makeProps({ name: "puesto_id", label: "Puesto" });

    // Act
    render(<SelectField {...props} />);
    const label = screen.getByText("Puesto");
    const select = screen.getByRole("combobox");

    // Assert
    expect(label).toHaveAttribute("for", "puesto_id");
    expect(select).toHaveAttribute("id", "puesto_id");
  });
});

describe("SelectField — interacción del usuario", () => {
  it("llama a onChange con el UUID correcto al seleccionar un rol", () => {
    // Arrange
    const onChange = vi.fn();
    const props = makeProps({ onChange, value: undefined });
    render(<SelectField {...props} />);
    const select = screen.getByRole("combobox");

    // Act
    fireEvent.change(select, {
      target: { value: ROLES.MANTENIMIENTO },
    });

    // Assert
    expect(onChange).toHaveBeenCalledTimes(1);
    const eventReceived = onChange.mock.calls[0][0];
    expect(eventReceived.target.value).toBe(ROLES.MANTENIMIENTO);
  });
});

describe("SelectField — estados y estilos", () => {
  it("bloquea el select cuando la prop disabled es true", () => {
    // Arrange
    const props = makeProps({ disabled: true });

    // Act
    render(<SelectField {...props} />);
    const select = screen.getByRole("combobox");

    // Assert
    expect(select).toBeDisabled();
  });

  it("cambia el color del texto dependiendo de si hay un valor seleccionado", () => {
    // Arrange
    const propsSinValor = makeProps({ value: "" });
    const propsConValor = makeProps({ value: ROLES.ADMINISTRADOR });

    // --- Caso 1: Sin valor seleccionado ---
    // Act
    const { rerender } = render(<SelectField {...propsSinValor} />);
    let select = screen.getByRole("combobox");

    // Assert
    expect(select).toHaveStyle({ color: "#aaaaaa" });

    // --- Caso 2: Con valor seleccionado ---
    // Act
    rerender(<SelectField {...propsConValor} />);
    select = screen.getByRole("combobox");

    // Assert
    expect(select).toHaveStyle({ color: "#121212" });
  });
});
