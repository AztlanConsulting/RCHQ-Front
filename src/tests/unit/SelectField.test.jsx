// tests/unit/SelectField.test.jsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import SelectField from "../../Components/Atoms/SelectField";

import { DOCUMENT_TYPES } from "../../Services/DocumentService";

const makeProps = (overrides = {}) => ({
  label: "Tipo de documento",
  id: "document-type",
  value: "",
  setValue: vi.fn(),
  options: DOCUMENT_TYPES,
  placeholder: "Selecciona un tipo",
  ...overrides,
});

describe("SelectField — renderizado base", () => {
  it("muestra el label con el texto recibido", () => {
    // Arrange
    const props = makeProps({ label: "Tipo de documento" });

    // Act
    render(<SelectField {...props} />);

    // Assert
    expect(screen.getByText("Tipo de documento")).toBeInTheDocument();
  });

  it("no renderiza label cuando no se pasa la prop", () => {
    // Arrange
    const { label, ...props } = makeProps();

    // Act
    const { container } = render(<SelectField {...props} />);

    // Assert
    expect(container.querySelector("label")).toBeNull();
  });

  it("muestra el asterisco cuando el campo es obligatorio", () => {
    // Arrange
    const props = makeProps({ required: true });

    // Act
    render(<SelectField {...props} />);

    // Assert
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("no muestra el asterisco cuando required=false", () => {
    // Arrange
    const props = makeProps({ required: false });

    // Act
    render(<SelectField {...props} />);

    // Assert
    expect(screen.queryByText("*")).toBeNull();
  });

  it("renderiza todos los tipos de documento disponibles y el placeholder", () => {
    // Arrange
    const props = makeProps();

    // Act
    render(<SelectField {...props} />);
    const options = screen.getAllByRole("option", { hidden: true });

    // Assert
    // +1 por el placeholder
    expect(options).toHaveLength(DOCUMENT_TYPES.length + 1);
    expect(screen.getByText("CV", { hidden: true })).toBeInTheDocument();
  });

  it("configura el placeholder correctamente como opción deshabilitada", () => {
    // Arrange
    const props = makeProps({ placeholder: "Selecciona un tipo" });

    // Act
    render(<SelectField {...props} />);
    const placeholder = screen.getByText("Selecciona un tipo", { hidden: true });

    // Assert
    expect(placeholder).toBeDisabled();
    expect(placeholder).toHaveAttribute("hidden");
    expect(placeholder).toHaveValue("");
  });

  it("vincula el label con el select mediante el ID", () => {
    // Arrange
    const props = makeProps({ id: "document-type", label: "Tipo de documento" });

    // Act
    render(<SelectField {...props} />);
    const label = screen.getByText("Tipo de documento");
    const select = screen.getByRole("combobox");

    // Assert
    expect(label).toHaveAttribute("for", "document-type");
    expect(select).toHaveAttribute("id", "document-type");
  });

  it("muestra el valor seleccionado correctamente", () => {
    // Arrange
    const props = makeProps({ value: "cv" });

    // Act
    render(<SelectField {...props} />);

    // Assert
    expect(screen.getByRole("combobox")).toHaveValue("cv");
  });
});

describe("SelectField — interacción del usuario", () => {
  it("llama a setValue con el nuevo valor al seleccionar una opción", () => {
    // Arrange
    const setValue = vi.fn();
    const props = makeProps({ setValue });
    render(<SelectField {...props} />);
    const select = screen.getByRole("combobox");

    // Act
    fireEvent.change(select, { target: { value: "nss" } });

    // Assert
    expect(setValue).toHaveBeenCalledTimes(1);
    expect(setValue).toHaveBeenCalledWith("nss");
  });
});

describe("SelectField — estados y estilos", () => {
  it("bloquea el select cuando disabled=true", () => {
    // Arrange
    const props = makeProps({ disabled: true });

    // Act
    render(<SelectField {...props} />);

    // Assert
    expect(screen.getByRole("combobox")).toBeDisabled();
  });

  it("cambia el color del texto dependiendo de si hay un valor seleccionado", () => {
    // Arrange
    const propsSinValor = makeProps({ value: "" });
    const propsConValor = makeProps({ value: "cv" });

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

  it("aplica el labelColor personalizado al label", () => {
    // Arrange
    const props = makeProps({ label: "Tipo", labelColor: "text-slate-700" });

    // Act
    render(<SelectField {...props} />);

    // Assert
    expect(screen.getByText("Tipo")).toHaveClass("text-slate-700");
  });
});