import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { BrowserRouter } from "react-router-dom";
import EmployeeRow from "../../components/molecules/employeeRow";

const renderInTable = (ui) =>
  render(
    <BrowserRouter>
      <table>
        <tbody>{ui}</tbody>
      </table>
    </BrowserRouter>,
  );

describe("EmployeeRow — renderizado con cells", () => {
  it("renderiza el contenido string de cada celda", () => {
    renderInTable(
      <EmployeeRow
        cells={[
          { key: "name", content: "Ana López" },
          { key: "role", content: "Psicóloga" },
        ]}
      />,
    );
    expect(screen.getByText("Ana López")).toBeInTheDocument();
    expect(screen.getByText("Psicóloga")).toBeInTheDocument();
  });

  it("renderiza contenido numérico en una celda", () => {
    renderInTable(
      <EmployeeRow cells={[{ key: "num", content: 42 }]} />,
    );
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("renderiza contenido JSX centrado en div", () => {
    renderInTable(
      <EmployeeRow
        cells={[
          { key: "badge", content: <span data-testid="badge">Activo</span> },
        ]}
      />,
    );
    expect(screen.getByTestId("badge")).toBeInTheDocument();
  });

  it("aplica className personalizada a la celda", () => {
    const { container } = renderInTable(
      <EmployeeRow
        cells={[{ key: "col", content: "Texto", className: "text-red-500" }]}
      />,
    );
    const td = container.querySelector("td");
    expect(td).toHaveClass("text-red-500");
  });

  it("no renderiza la celda de acciones si actions es undefined", () => {
    const { container } = renderInTable(
      <EmployeeRow cells={[{ key: "name", content: "Sin acciones" }]} />,
    );
    const tds = container.querySelectorAll("td");
    expect(tds).toHaveLength(1);
  });

  it("renderiza la celda de acciones si actions tiene valor", () => {
    renderInTable(
      <EmployeeRow
        cells={[{ key: "name", content: "Con acciones" }]}
        actions={<button>Ver</button>}
      />,
    );
    expect(screen.getByRole("button", { name: "Ver" })).toBeInTheDocument();
  });

  it("ejecuta el handler de la acción al hacer click", () => {
    const onClick = vi.fn();
    renderInTable(
      <EmployeeRow
        cells={[{ key: "name", content: "Test" }]}
        actions={<button onClick={onClick}>Eliminar</button>}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Eliminar" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("renderiza correctamente sin cells (array vacío)", () => {
    const { container } = renderInTable(<EmployeeRow cells={[]} />);
    const tr = container.querySelector("tr");
    expect(tr).toBeInTheDocument();
  });
});