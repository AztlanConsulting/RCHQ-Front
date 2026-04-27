import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Loader from "../../Components/Atoms/Loader";

vi.mock("../../Components/untitled/loading-indicator/loading-indicator", () => ({
  LoadingIndicator: ({ type, size }) => (
    <div data-testid="loading-indicator" data-type={type} data-size={size} />
  ),
}));

describe("Loader", () => {
  it("renderiza LoadingIndicator con type dot-circle y size md por defecto", () => {
    render(<Loader />);
    const el = screen.getByTestId("loading-indicator");
    expect(el).toHaveAttribute("data-type", "dot-circle");
    expect(el).toHaveAttribute("data-size", "md");
  });

  it("pasa el size al indicador", () => {
    render(<Loader size="lg" />);
    expect(screen.getByTestId("loading-indicator")).toHaveAttribute(
      "data-size",
      "lg",
    );
  });
});
