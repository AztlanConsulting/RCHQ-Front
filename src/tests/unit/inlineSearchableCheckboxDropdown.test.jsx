import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import InlineSearchableCheckboxDropdown from "../../components/molecules/inlineSearchableCheckboxDropdown";

describe("InlineSearchableCheckboxDropdown", () => {
  const defaultProps = {
    label: "TRABAJADOR",
    name: "employee",
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

  it("oculta las opciones hasta abrir el panel", () => {
    render(<InlineSearchableCheckboxDropdown {...defaultProps} />);

    expect(screen.queryByText("María González")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /luis martínez/i }));

    expect(screen.getByText("María González")).toBeInTheDocument();
  });

  it("propaga la búsqueda al escribir en el input", () => {
    const onSearchChange = vi.fn();

    render(
      <InlineSearchableCheckboxDropdown
        {...defaultProps}
        onSearchChange={onSearchChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /luis martínez/i }));
    fireEvent.change(screen.getByRole("textbox", { name: /buscar/i }), {
      target: { value: "mar" },
    });

    expect(onSearchChange).toHaveBeenCalledWith("mar");
  });
});
