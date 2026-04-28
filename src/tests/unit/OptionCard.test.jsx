// tests/unit/OptionCard.test.jsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import OptionCard from "../../Components/Molecules/OptionCard";

const MockIcon = () => <svg data-testid="mock-icon" />;

describe("OptionCard", () => {
  it("renderiza el label correctamente", () => {
    render(
      <OptionCard icon={<MockIcon />} label="Documentos" onClick={() => {}} />,
    );
    expect(screen.getByText("Documentos")).toBeInTheDocument();
  });

  it("renderiza el icono correctamente", () => {
    render(
      <OptionCard icon={<MockIcon />} label="Documentos" onClick={() => {}} />,
    );
    expect(screen.getByTestId("mock-icon")).toBeInTheDocument();
  });

  it("llama a onClick cuando se hace click", () => {
    const handleClick = vi.fn();
    render(
      <OptionCard
        icon={<MockIcon />}
        label="Documentos"
        onClick={handleClick}
      />,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("renderiza un botón", () => {
    render(
      <OptionCard icon={<MockIcon />} label="Empleados" onClick={() => {}} />,
    );
    expect(screen.getByRole("button")).toBeInTheDocument();
  });
});
