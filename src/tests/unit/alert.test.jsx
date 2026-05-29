import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Alert from "../../components/atoms/alerts";

describe("Alert — renderizado base", () => {
    it("renderiza el mensaje de texto en el DOM", () => {
        const message = "Operación exitosa";

        render(<Alert type="success" message={message} />);

        expect(screen.getByText("Operación exitosa")).toBeInTheDocument();
    });

    it("aplica la clase de fondo verde para el tipo success", () => {
        const { container } = render(<Alert type="success" message="OK" />);

        expect(container.firstChild).toHaveClass("bg-[#7FD447]");
    });

    it("aplica la clase de fondo rojo para el tipo error", () => {
        const { container } = render(<Alert type="error" message="Error" />);

        expect(container.firstChild).toHaveClass("bg-[#ff7b7b]");
    });

    it("aplica la clase de fondo amarillo para el tipo warning", () => {
        const { container } = render(
            <Alert type="warning" message="Advertencia" />,
        );

        expect(container.firstChild).toHaveClass("bg-yellow-400");
    });

    it("aplica la clase de fondo azul para el tipo info", () => {
        const { container } = render(
            <Alert type="info" message="Información" />,
        );

        expect(container.firstChild).toHaveClass("bg-blue-500");
    });

    it("renderiza un nodo React como mensaje", () => {
        const message = (
            <ul>
                <li>Error 1</li>
                <li>Error 2</li>
            </ul>
        );

        render(<Alert type="error" message={message} />);

        expect(screen.getByText("Error 1")).toBeInTheDocument();
        expect(screen.getByText("Error 2")).toBeInTheDocument();
    });

    it("muestra el ícono del alert correctamente", () => {
        render(<Alert type="success" message="OK" />);

        const icon = document.querySelector("img");
        expect(icon).toBeInTheDocument();
        expect(icon.getAttribute("src")).toBeTruthy();
    });

    it("no lanza errores cuando el tipo warning no tiene ícono asignado", () => {
        const { container } = render(
            <Alert type="warning" message="Advertencia" />,
        );

        expect(container.firstChild).toBeInTheDocument();
    });
});
