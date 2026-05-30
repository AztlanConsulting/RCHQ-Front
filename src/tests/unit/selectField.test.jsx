import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import SelectField from "../../components/atoms/selectField";

const DOCUMENT_TYPES = [
  { value: "cv",  label: "CV" },
  { value: "nss", label: "NSS" },
  { value: "ine", label: "INE" },
];

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
    const props = makeProps({ label: "Tipo de documento" });

    render(<SelectField {...props} />);

    expect(screen.getByText("Tipo de documento")).toBeInTheDocument();
  });

  it("no renderiza label cuando no se pasa la prop", () => {
    const props = makeProps({ label: undefined });

    const { container } = render(<SelectField {...props} />);

    expect(container.querySelector("label")).toBeNull();
  });

  it("muestra el asterisco cuando el campo es obligatorio", () => {
    const props = makeProps({ required: true });

    render(<SelectField {...props} />);

    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("no muestra el asterisco cuando required=false", () => {
    const props = makeProps({ required: false });

    render(<SelectField {...props} />);

    expect(screen.queryByText("*")).toBeNull();
  });

  it("renderiza todos los tipos de documento disponibles y el placeholder", () => {
    const props = makeProps();

    render(<SelectField {...props} />);
    const options = screen.getAllByRole("option", { hidden: true });

    expect(options).toHaveLength(DOCUMENT_TYPES.length + 1);
    expect(screen.getByText("CV", { hidden: true })).toBeInTheDocument();
  });

  it("configura el placeholder correctamente como opción deshabilitada", () => {
    const props = makeProps({ placeholder: "Selecciona un tipo" });

    render(<SelectField {...props} />);
    const placeholder = screen.getByText("Selecciona un tipo", {
      hidden: true,
    });

    expect(placeholder).toBeDisabled();
    expect(placeholder).toHaveAttribute("hidden");
    expect(placeholder).toHaveValue("");
  });

  it("vincula el label con el select mediante el ID", () => {
    const props = makeProps({
      id: "document-type",
      label: "Tipo de documento",
    });

    render(<SelectField {...props} />);
    const label = screen.getByText("Tipo de documento");
    const select = screen.getByRole("combobox");

    expect(label).toHaveAttribute("for", "document-type");
    expect(select).toHaveAttribute("id", "document-type");
  });

  it("muestra el valor seleccionado correctamente", () => {
    const props = makeProps({ value: "cv" });

    render(<SelectField {...props} />);

    expect(screen.getByRole("combobox")).toHaveValue("cv");
  });
});

describe("SelectField — interacción del usuario", () => {
  it("llama a setValue con el nuevo valor al seleccionar una opción", () => {
    const setValue = vi.fn();
    const props = makeProps({ setValue });
    render(<SelectField {...props} />);
    const select = screen.getByRole("combobox");

    fireEvent.change(select, { target: { value: "nss" } });

    expect(setValue).toHaveBeenCalledTimes(1);
    expect(setValue).toHaveBeenCalledWith("nss");
  });
});

describe("SelectField — estados y estilos", () => {
  it("bloquea el select cuando disabled=true", () => {
    const props = makeProps({ disabled: true });

    render(<SelectField {...props} />);

    expect(screen.getByRole("combobox")).toBeDisabled();
  });

  it("cambia el color del texto dependiendo de si hay un valor seleccionado", () => {
    const propsSinValor = makeProps({ value: "" });
    const propsConValor = makeProps({ value: "cv" });

    const { rerender } = render(<SelectField {...propsSinValor} />);
    let select = screen.getByRole("combobox");

    expect(select).toHaveStyle({ color: "#aaaaaa" });

    rerender(<SelectField {...propsConValor} />);
    select = screen.getByRole("combobox");

    expect(select).toHaveStyle({ color: "#121212" });
  });

  it("aplica el labelColor personalizado al label", () => {
    const props = makeProps({ label: "Tipo", labelColor: "text-slate-700" });

    render(<SelectField {...props} />);

    expect(screen.getByText("Tipo")).toHaveClass("text-slate-700");
  });
});
