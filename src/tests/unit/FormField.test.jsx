import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import FormField from "../../Components/Organism/FormField";

describe("FormField — renderizado", () => {
  it("muestra el label cuando se proporciona", () => {
    render(<FormField label="Nombre" name="name" value="" onChange={() => {}} />);
    expect(screen.getByText("Nombre")).toBeInTheDocument();
  });

  it("no muestra label cuando no se proporciona", () => {
    render(<FormField name="name" value="" onChange={() => {}} />);
    expect(screen.queryByRole("label")).toBeNull();
  });

  it("muestra el asterisco cuando required=true", () => {
    render(<FormField label="Nombre" name="name" value="" onChange={() => {}} required />);
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("no muestra el asterisco cuando required=false", () => {
    render(<FormField label="Nombre" name="name" value="" onChange={() => {}} />);
    expect(screen.queryByText("*")).toBeNull();
  });

  it("asocia el label con el input mediante htmlFor/id", () => {
    render(<FormField label="Nombre" name="name" value="" onChange={() => {}} />);
    const label = screen.getByText("Nombre").closest("label");
    expect(label).toHaveAttribute("for", "name");
  });
});

describe("FormField — interacción", () => {
  it("llama a onChange con un evento sintético al cambiar el valor", () => {
    const handleChange = vi.fn();
    render(<FormField label="Nombre" name="name" value="" onChange={handleChange} />);
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "Juan" } });
    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({ name: "name", value: "Juan" }),
      }),
    );
  });

  it("respeta el maxLength pasado al input", () => {
    render(<FormField label="RFC" name="rfc" value="" onChange={() => {}} maxLength={13} />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("maxlength", "13");
  });

  it("aplica el color de label personalizado", () => {
    render(
      <FormField label="Correo" name="email" value="" onChange={() => {}} labelColor="text-red-500" />,
    );
    const label = screen.getByText("Correo").closest("label");
    expect(label.className).toContain("text-red-500");
  });
});