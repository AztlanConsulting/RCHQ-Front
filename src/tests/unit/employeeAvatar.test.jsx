import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import EmployeeAvatar from "../../components/atoms/employeeAvatar";

vi.mock("../../../src/utils/env", () => ({}));

vi.stubEnv("VITE_API_URL", "http://localhost:3000");

describe("EmployeeAvatar — sin imagen", () => {
  it("muestra el SVG de placeholder cuando no hay picture ni src", () => {
    const { container } = render(<EmployeeAvatar fullName="Juan" />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("aplica la clase de tamaño por defecto w-12 h-12", () => {
    const { container } = render(<EmployeeAvatar fullName="Juan" />);
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass("w-12", "h-12");
  });

  it("aplica clase personalizada mediante la prop className", () => {
    const { container } = render(
      <EmployeeAvatar fullName="Juan" className="w-20 h-20" />,
    );
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass("w-20", "h-20");
  });
});

describe("EmployeeAvatar — con picture (prefijo API)", () => {
  it("renderiza un <img> con la URL construida con API_URL + picture", () => {
    render(<EmployeeAvatar picture="avatars/juan.jpg" fullName="Juan" />);
    const img = screen.getByAltText("Juan");
    expect(img).toBeInTheDocument();
    expect(img.src).toContain("avatars/juan.jpg");
  });

  it("usa fullName como alt del <img>", () => {
    render(<EmployeeAvatar picture="avatars/ana.jpg" fullName="Ana García" />);
    expect(screen.getByAltText("Ana García")).toBeInTheDocument();
  });
});

describe("EmployeeAvatar — con src (URL completa)", () => {
  it("src tiene prioridad sobre picture", () => {
    render(
      <EmployeeAvatar
        src="https://cdn.example.com/foto.jpg"
        picture="avatars/local.jpg"
        fullName="Test"
      />,
    );
    const img = screen.getByAltText("Test");
    expect(img.src).toBe("https://cdn.example.com/foto.jpg");
    expect(img.src).not.toContain("local.jpg");
  });

  it("muestra imagen con src aunque picture sea undefined", () => {
    render(
      <EmployeeAvatar src="https://cdn.example.com/foto.jpg" fullName="Test" />,
    );
    expect(screen.getByAltText("Test")).toBeInTheDocument();
  });
});