import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ConfirmRejectVacationModal from "../../components/molecules/confirmRejectVacationModal";

const request = {
    vacationRequestId: "vac-001",
    employee: {
        fullName: "Ana Pendiente",
        curp: "US800101HDF00003",
    },
};

describe("ConfirmRejectVacationModal", () => {
    it("no renderiza nada si no hay request", () => {
        const { container } = render(
            <ConfirmRejectVacationModal
                request={null}
                onCancel={vi.fn()}
                onConfirm={vi.fn()}
            />,
        );

        expect(container).toBeEmptyDOMElement();
    });

    it("muestra la información de confirmación", () => {
        render(
            <ConfirmRejectVacationModal
                request={request}
                onCancel={vi.fn()}
                onConfirm={vi.fn()}
            />,
        );

        expect(
            screen.getByRole("dialog", { name: "Rechazar solicitud" }),
        ).toBeInTheDocument();
        expect(screen.getByText("Ana Pendiente")).toBeInTheDocument();
        expect(screen.getByText(/US800101HDF00003/)).toBeInTheDocument();
        expect(
            screen.getByText(/Esta acción moverá la solicitud a revisadas/),
        ).toBeInTheDocument();
    });

    it("llama onCancel al presionar Cancelar", () => {
        const onCancel = vi.fn();

        render(
            <ConfirmRejectVacationModal
                request={request}
                onCancel={onCancel}
                onConfirm={vi.fn()}
            />,
        );

        fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));

        expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it("llama onConfirm al presionar Rechazar", () => {
        const onConfirm = vi.fn();

        render(
            <ConfirmRejectVacationModal
                request={request}
                onCancel={vi.fn()}
                onConfirm={onConfirm}
            />,
        );

        fireEvent.click(screen.getByRole("button", { name: "Rechazar" }));

        expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it("muestra estado loading y deshabilita botones", () => {
        render(
            <ConfirmRejectVacationModal
                request={request}
                loading={true}
                onCancel={vi.fn()}
                onConfirm={vi.fn()}
            />,
        );

        expect(screen.getByRole("button", { name: "Cancelar" })).toBeDisabled();
        expect(screen.getByRole("button", { name: "Rechazando..." })).toBeDisabled();
    });

    it("muestra error si se recibe error", () => {
        render(
            <ConfirmRejectVacationModal
                request={request}
                error="No se pudo rechazar la solicitud"
                onCancel={vi.fn()}
                onConfirm={vi.fn()}
            />,
        );

        expect(
            screen.getByText("No se pudo rechazar la solicitud"),
        ).toBeInTheDocument();
    });

    it("usa texto genérico si no hay empleado", () => {
        render(
            <ConfirmRejectVacationModal
                request={{
                    vacationRequestId: "vac-002",
                    employee: {},
                }}
                onCancel={vi.fn()}
                onConfirm={vi.fn()}
            />,
        );

        expect(screen.getByText("este empleado")).toBeInTheDocument();
    });
});
