import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Loader from "../../Components/Atoms/loader";

describe("Loader", () => {
  it("renderiza un spinner con size md por defecto", () => {
    render(<Loader />);
    const spinner = screen.getByRole("status");
    expect(spinner).toHaveClass("h-6", "w-6", "border-2");
  });

  it("aplica el size correcto al spinner", () => {
    render(<Loader size="lg" />);
    const spinner = screen.getByRole("status");
    expect(spinner).toHaveClass("h-8", "w-8", "border-[3px]");
  });

  it("aplica el size sm al spinner", () => {
    render(<Loader size="sm" />);
    const spinner = screen.getByRole("status");
    expect(spinner).toHaveClass("h-4", "w-4", "border-2");
  });
});
