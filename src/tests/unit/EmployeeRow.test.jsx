import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { BrowserRouter } from "react-router-dom";
import EmployeeRow from "../../Components/Molecules/EmployeeRow";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

describe("EmployeeRow Component", () => {
    const mockEmployee = {
        employeeId: "123",
        fullName: "Jane Doe",
        role: "Software Engineer",
        status: true,
        picture: "path/to/photo.jpg",
    };

    const renderInTable = (component) => {
        return render(
            <BrowserRouter>
                <table>
                    <tbody>{component}</tbody>
                </table>
            </BrowserRouter>,
        );
    };

    it("debe mostrar la información correctamente (Nombre y Rol)", () => {
        renderInTable(<EmployeeRow employee={mockEmployee} />);

        expect(screen.getByText("Jane Doe")).toBeInTheDocument();
        expect(screen.getByText("Software Engineer")).toBeInTheDocument();
    });

    it('debe navegar a los detalles del empleado al hacer clic en el botón "Ver"', () => {
        renderInTable(<EmployeeRow employee={mockEmployee} />);

        const button = screen.getByRole("button", { name: /ver empleado/i });
        fireEvent.click(button);

        expect(mockNavigate).toHaveBeenCalledWith("/app/personal/ver/123");
    });

    it("debe pasar las props correctas a StatusBadge", () => {
        renderInTable(<EmployeeRow employee={mockEmployee} />);

        expect(screen.getByText(/activo/i)).toBeInTheDocument();
    });

    it("debe renderizar el avatar con la imagen del empleado", () => {
        renderInTable(<EmployeeRow employee={mockEmployee} />);

        const avatarImg = screen.getByAltText("Jane Doe");
        expect(avatarImg).toBeInTheDocument();
    });
});
