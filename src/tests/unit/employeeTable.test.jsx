import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { BrowserRouter } from "react-router-dom";
import EmployeeTable from "../../components/organism/employeeTable";

const renderWithRouter = (ui) => render(<BrowserRouter>{ui}</BrowserRouter>);

const COLUMNS = ["Nombre", "Rol", "Acciones"];
const EMPLOYEES = [
  { id: "1", name: "Ana" },
  { id: "2", name: "Luis" },
];

describe("EmployeeTable — estados de presentación", () => {
  it("muestra loadingMessage mientras carga", () => {
    renderWithRouter(
      <EmployeeTable
        employees={[]}
        loading={true}
        loadingMessage="Cargando registros..."
      />,
    );
    expect(screen.getByText("Cargando registros...")).toBeInTheDocument();
  });

  it("muestra el mensaje de error con clase roja", () => {
    renderWithRouter(
      <EmployeeTable employees={[]} loading={false} error="Fallo de red" />,
    );
    const el = screen.getByText("Error: Fallo de red");
    expect(el).toBeInTheDocument();
    expect(el).toHaveClass("text-red-500");
  });

  it("muestra emptyMessage cuando la lista está vacía", () => {
    renderWithRouter(
      <EmployeeTable
        employees={[]}
        loading={false}
        emptyMessage="Sin ausencias"
      />,
    );
    expect(screen.getByText("Sin ausencias")).toBeInTheDocument();
  });

  it("usa emptyMessage por defecto si no se pasa", () => {
    renderWithRouter(
      <EmployeeTable employees={[]} loading={false} renderRow={vi.fn()} />,
    );
    expect(screen.getByText("No hay registros disponibles")).toBeInTheDocument();
  });
});

describe("EmployeeTable — tabla con datos", () => {
  it("renderiza las cabeceras de columna pasadas por prop", () => {
    renderWithRouter(
      <EmployeeTable
        employees={EMPLOYEES}
        loading={false}
        columns={COLUMNS}
        renderRow={(emp, i) => (
          <tr key={i}>
            <td>{emp.name}</td>
          </tr>
        )}
      />,
    );
    COLUMNS.forEach((col) =>
      expect(screen.getByText(col)).toBeInTheDocument(),
    );
  });

  it("llama a renderRow por cada elemento del array", () => {
    const renderRow = vi.fn((emp, i) => (
      <tr key={i}>
        <td>{emp.name}</td>
      </tr>
    ));
    renderWithRouter(
      <EmployeeTable
        employees={EMPLOYEES}
        loading={false}
        columns={COLUMNS}
        renderRow={renderRow}
      />,
    );
    expect(renderRow).toHaveBeenCalledTimes(EMPLOYEES.length);
  });

  it("muestra el contenido renderizado por renderRow", () => {
    renderWithRouter(
      <EmployeeTable
        employees={EMPLOYEES}
        loading={false}
        columns={COLUMNS}
        renderRow={(emp, i) => (
          <tr key={i}>
            <td>{emp.name}</td>
          </tr>
        )}
      />,
    );
    expect(screen.getByText("Ana")).toBeInTheDocument();
    expect(screen.getByText("Luis")).toBeInTheDocument();
  });

  it("loading tiene prioridad sobre los datos", () => {
    renderWithRouter(
      <EmployeeTable
        employees={EMPLOYEES}
        loading={true}
        loadingMessage="Espera..."
        columns={COLUMNS}
        renderRow={(emp, i) => <tr key={i}><td>{emp.name}</td></tr>}
      />,
    );
    expect(screen.getByText("Espera...")).toBeInTheDocument();
    expect(screen.queryByText("Ana")).not.toBeInTheDocument();
  });
});