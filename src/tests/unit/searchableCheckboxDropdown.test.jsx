import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import SearchableCheckboxDropdown from "../../components/molecules/searchableCheckboxDropdown";

vi.mock("flowbite-react", () => ({
  Dropdown: ({ renderTrigger, children }) => (
    <div>
      <div>{renderTrigger()}</div>
      <div>{children}</div>
    </div>
  ),
  Checkbox: (props) => <input type="checkbox" {...props} />,
}));

describe("SearchableCheckboxDropdown", () => {
  const defaultProps = {
    label: "TRABAJADOR",
    name: "absence-employee",
    filteredOptions: [
      { value: "1", label: "Luis Martínez" },
      { value: "2", label: "María González" },
    ],
    values: ["1"],
    search: "",
    selectedLabel: "Luis Martínez",
    onSearchChange: vi.fn(),
    onToggleValue: vi.fn(),
    onClearSelection: vi.fn(),
  };

  it("renderiza el label, el trigger y las opciones", () => {
    render(<SearchableCheckboxDropdown {...defaultProps} />);

    expect(screen.getByText("TRABAJADOR")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /luis martínez/i })).toBeInTheDocument();
    expect(screen.getAllByText("Luis Martínez")).toHaveLength(2);
    expect(screen.getByText("María González")).toBeInTheDocument();
  });

  it("propaga la búsqueda al escribir en el input", () => {
    const onSearchChange = vi.fn();

    render(
      <SearchableCheckboxDropdown
        {...defaultProps}
        onSearchChange={onSearchChange}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText(/buscar trabajador/i), {
      target: { value: "mar" },
    });

    expect(onSearchChange).toHaveBeenCalledWith("mar");
  });

  it("propaga el cambio de selección del checkbox", () => {
    const onToggleValue = vi.fn();

    render(
      <SearchableCheckboxDropdown
        {...defaultProps}
        onToggleValue={onToggleValue}
      />,
    );

    const checkboxes = screen.getAllByRole("checkbox");
    fireEvent.click(checkboxes[1]);

    expect(onToggleValue).toHaveBeenCalledWith("2", true);
  });

  it("llama a limpiar selección al hacer click en el botón", () => {
    const onClearSelection = vi.fn();

    render(
      <SearchableCheckboxDropdown
        {...defaultProps}
        onClearSelection={onClearSelection}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /limpiar selección/i }));

    expect(onClearSelection).toHaveBeenCalledTimes(1);
  });

  it("muestra mensaje de vacío cuando no hay coincidencias", () => {
    render(
      <SearchableCheckboxDropdown
        {...defaultProps}
        filteredOptions={[]}
      />,
    );

    expect(screen.getByText(/sin coincidencias/i)).toBeInTheDocument();
  });
});
