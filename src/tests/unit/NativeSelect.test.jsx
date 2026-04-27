import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { NativeSelect } from "../../Components/untitled/base/select/select-native";

describe("NativeSelect (untitled)", () => {
  const options = [
    { label: "Uno", value: "1" },
    { label: "Dos", value: "2" },
  ];

  it("renderiza las opciones y el valor controlado", () => {
    render(
      <NativeSelect
        aria-label="Elegir"
        value="2"
        onChange={() => {}}
        options={options}
      />,
    );
    expect(screen.getByLabelText("Elegir")).toHaveValue("2");
    expect(screen.getByRole("option", { name: "Uno" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Dos" })).toBeInTheDocument();
  });

  it("llama onChange con el valor seleccionado", () => {
    const onChange = vi.fn();
    render(
      <NativeSelect
        aria-label="Elegir"
        value="1"
        onChange={onChange}
        options={options}
      />,
    );
    fireEvent.change(screen.getByLabelText("Elegir"), {
      target: { value: "2" },
    });
    expect(onChange).toHaveBeenCalled();
  });
});
