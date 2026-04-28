import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import StatusBadge from "../../Components/Atoms/StatusBadge";

describe("StatusBadge Component", () => {
    it('debe mostrar "Activo" y clases verdes cuando isActive es true', () => {
        render(<StatusBadge isActive={true} />);

        const badge = screen.getByText(/activo/i);

        expect(badge).toBeInTheDocument();
        expect(badge).toHaveClass("bg-green-100");
        expect(badge).toHaveClass("text-green-800");
    });

    it('debe mostrar "Inactivo" y clases rojas cuando isActive es false', () => {
        render(<StatusBadge isActive={false} />);

        const badge = screen.getByText(/inactivo/i);

        expect(badge).toBeInTheDocument();
        expect(badge).toHaveClass("bg-red-100");
        expect(badge).toHaveClass("text-red-800");
    });

    it("debe aplicar clases adicionales pasadas por la prop className", () => {
        const customClass = "shadow-lg";
        render(<StatusBadge isActive={true} className={customClass} />);

        const badge = screen.getByText(/activo/i);

        expect(badge).toHaveClass("shadow-lg");
        expect(badge).toHaveClass("rounded-full"); // Clase base
    });

    it("debe renderizarse como Inactivo por defecto si no se pasa isActive (undefined)", () => {
        render(<StatusBadge />);

        const badge = screen.getByText(/inactivo/i);
        expect(badge).toBeInTheDocument();
    });
});
