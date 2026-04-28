import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { BrowserRouter } from "react-router-dom";
import EmployeeTable from "../../Components/Molecules/EmployeeTable";

vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return { ...actual, useNavigate: () => vi.fn() };
});

describe("EmployeeTable Component", () => {
    const mockEmployees = [
        { employeeId: "1", fullName: "Alice Smith", role: "Dev", status: true },
        {
            employeeId: "2",
            fullName: "Bob Jones",
            role: "Design",
            status: false,
        },
    ];

    const renderWithRouter = (ui) =>
        render(<BrowserRouter>{ui}</BrowserRouter>);

    it("debe mostrar el mensaje de carga cuando loading es true", () => {
        renderWithRouter(<EmployeeTable employees={[]} loading={true} />);
        expect(screen.getByText(/cargando empleados/i)).toBeInTheDocument();
    });

    it("debe mostrar el mensaje de error cuando existe un error", () => {
        const errorMessage = "Fallo de conexión";
        renderWithRouter(
            <EmployeeTable
                employees={[]}
                loading={false}
                error={errorMessage}
            />,
        );
        expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
        expect(screen.getByText(`Error: ${errorMessage}`)).toHaveClass(
            "text-red-500",
        );
    });

    it('debe mostrar mensaje de "No hay empleados" si la lista está vacía', () => {
        renderWithRouter(<EmployeeTable employees={[]} loading={false} />);
        expect(
            screen.getByText(/no hay empleados disponibles/i),
        ).toBeInTheDocument();
    });

    it("debe renderizar los encabezados de la tabla correctamente", () => {
        renderWithRouter(
            <EmployeeTable employees={mockEmployees} loading={false} />,
        );

        expect(screen.getByText("Foto")).toBeInTheDocument();
        expect(screen.getByText("Nombre Completo")).toBeInTheDocument();
        expect(screen.getByText("Puesto")).toBeInTheDocument();
        expect(screen.getByText("Estado")).toBeInTheDocument();
        expect(screen.getByText("Acciones")).toBeInTheDocument();
    });

    it("debe renderizar tantas filas como empleados existan en el array", () => {
        renderWithRouter(
            <EmployeeTable employees={mockEmployees} loading={false} />,
        );

        const rows = screen.getAllByRole("row");
        expect(rows).toHaveLength(mockEmployees.length + 1);

        expect(screen.getByText("Alice Smith")).toBeInTheDocument();
        expect(screen.getByText("Bob Jones")).toBeInTheDocument();
    });
});
