import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Type from "../../Components/Atoms/Type";

describe("Type", () => {
  it("renderiza el texto con variante body por defecto", () => {
    render(<Type>Hola</Type>);
    expect(screen.getByText("Hola")).toBeInTheDocument();
  });

  it("usa el elemento personalizado vía as", () => {
    const { container } = render(
      <Type variant="page-title" as="h1">
        Título
      </Type>,
    );
    const h1 = container.querySelector("h1");
    expect(h1).toBeInTheDocument();
    expect(h1).toHaveTextContent("Título");
  });

  it("aplica clases de page-title y display-name distintas", () => {
    const { container: c1 } = render(
      <Type variant="page-title" as="h2">
        A
      </Type>,
    );
    const { container: c2 } = render(
      <Type variant="display-name" as="h2">
        B
      </Type>,
    );
    const pageTitle = c1.querySelector("h2");
    const displayName = c2.querySelector("h2");
    expect(pageTitle).toHaveClass("text-2xl");
    expect(pageTitle).toHaveClass("sm:text-3xl");
    expect(displayName).toHaveClass("text-xl");
  });

  it("combina className con las clases de variante", () => {
    const { container } = render(
      <Type variant="metric-label" className="mt-2">
        Label
      </Type>,
    );
    expect(container.firstChild).toHaveClass("mt-2");
    expect(container.firstChild).toHaveClass("text-xs");
  });

  it("aplica size y color cuando se proveen", () => {
    const { container } = render(
      <Type variant="body" size="lg" color="muted">
        Texto
      </Type>,
    );
    expect(container.firstChild).toHaveClass("text-lg");
    expect(container.firstChild).toHaveClass("text-slate-500");
  });

  it("aplica weight cuando se provee", () => {
    const { container } = render(
      <Type variant="body" weight="semibold">
        Negrita
      </Type>,
    );
    expect(container.firstChild).toHaveClass("font-semibold");
  });
});
