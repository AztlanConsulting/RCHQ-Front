import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Chip from "../../Components/Atoms/Chip";

describe("Chip", () => {
  it("muestra Activo y aria-label adecuado cuando active es true", () => {
    render(<Chip active />);
    expect(screen.getByText("Activo")).toBeInTheDocument();
    expect(
      screen.getByRole("status", { name: "Empleado activo" }),
    ).toBeInTheDocument();
  });

  it("muestra Inactivo y aria-label adecuado cuando active es false", () => {
    render(<Chip active={false} />);
    expect(screen.getByText("Inactivo")).toBeInTheDocument();
    expect(
      screen.getByRole("status", { name: "Empleado inactivo" }),
    ).toBeInTheDocument();
  });

  it("añade className al contenedor", () => {
    const { container } = render(
      <Chip className="ml-1 focus:outline-none" />,
    );
    expect(container.firstChild).toHaveClass("ml-1");
    expect(container.firstChild).toHaveClass("focus:outline-none");
  });
});
