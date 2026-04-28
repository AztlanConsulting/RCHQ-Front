import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Pagination from "../../Components/Molecules/Pagination";

describe("Pagination Component", () => {
    const mockOnPrev = vi.fn();
    const mockOnNext = vi.fn();

    const defaultProps = {
        page: 2,
        totalPages: 5,
        total: 50,
        onPrevPage: mockOnPrev,
        onNextPage: mockOnNext,
        loading: false,
        hasEmployees: true,
    };

    it("no debe renderizar nada si está cargando o no hay empleados", () => {
        const { container: containerLoading } = render(
            <Pagination {...defaultProps} loading={true} />,
        );
        expect(containerLoading.firstChild).toBeNull();

        const { container: containerNoEmployees } = render(
            <Pagination {...defaultProps} hasEmployees={false} />,
        );
        expect(containerNoEmployees.firstChild).toBeNull();
    });

    it("debe mostrar la información de página y total correctamente", () => {
        render(<Pagination {...defaultProps} />);

        expect(screen.getByText(/página 2 de 5/i)).toBeInTheDocument();
        expect(screen.getByText(/total: 50 empleados/i)).toBeInTheDocument();
    });

    it('debe deshabilitar el botón "Anterior" cuando se está en la página 1', () => {
        render(<Pagination {...defaultProps} page={1} />);

        const prevButton = screen.getByRole("button", { name: /anterior/i });
        expect(prevButton).toBeDisabled();
    });

    it('debe deshabilitar el botón "Siguiente" cuando se está en la última página', () => {
        render(<Pagination {...defaultProps} page={5} totalPages={5} />);

        const nextButton = screen.getByRole("button", { name: /siguiente/i });
        expect(nextButton).toBeDisabled();
    });

    it("debe llamar a onPrevPage y onNextPage al hacer clic", () => {
        render(<Pagination {...defaultProps} />);

        const prevButton = screen.getByRole("button", { name: /anterior/i });
        const nextButton = screen.getByRole("button", { name: /siguiente/i });

        fireEvent.click(prevButton);
        expect(mockOnPrev).toHaveBeenCalledTimes(1);

        fireEvent.click(nextButton);
        expect(mockOnNext).toHaveBeenCalledTimes(1);
    });

    it("debe mantener ambos botones habilitados si está en una página intermedia", () => {
        render(<Pagination {...defaultProps} page={3} totalPages={10} />);

        expect(
            screen.getByRole("button", { name: /anterior/i }),
        ).not.toBeDisabled();
        expect(
            screen.getByRole("button", { name: /siguiente/i }),
        ).not.toBeDisabled();
    });
});
