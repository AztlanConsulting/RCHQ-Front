import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ConfirmApproveVacationModal from "../../components/molecules/confirmApproveVacationModal";

const request = {
    vacationRequestId: "vac-001",
    employee: {
        fullName: "Ana Pendiente",
        curp: "US800101HDF00003",
    },
};

describe("ConfirmApproveVacationModal", () => {
    it("no renderiza nada si no hay request", () => {
        const { container } = render(
            <ConfirmApproveVacationModal
                request={null}
                onCancel={vi.fn()}
                onConfirm={vi.fn()}
            />,
        );

        expect(container).toBeEmptyDOMElement();
    });

    it("muestra la información de confirmación", () => {
        render(
            <ConfirmApproveVacationModal
                request={request}
                onCancel={vi.fn()}
                onConfirm={vi.fn()}
            />,
        );

        expect(
            screen.getByRole("dialog", { name: "Aprobar solicitud" }),
        ).toBeInTheDocument();
        expect(screen.getByText("Ana Pendiente")).toBeInTheDocument();
        expect(
            screen.getByText(/US800101HDF00003/),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/Esta acción moverá la solicitud a revisadas/),
        ).toBeInTheDocument();
    });

    it("llama onCancel al presionar Cancelar", () => {
        const onCancel = vi.fn();

        render(
            <ConfirmApproveVacationModal
                request={request}
                onCancel={onCancel}
                onConfirm={vi.fn()}
            />,
        );

        fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));

        expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it("llama onConfirm al presionar Aprobar", () => {
        const onConfirm = vi.fn();

        render(
            <ConfirmApproveVacationModal
                request={request}
                onCancel={vi.fn()}
                onConfirm={onConfirm}
            />,
        );

        fireEvent.click(screen.getByRole("button", { name: "Aprobar" }));

        expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it("muestra estado loading y deshabilita botones", () => {
        render(
            <ConfirmApproveVacationModal
                request={request}
                loading={true}
                onCancel={vi.fn()}
                onConfirm={vi.fn()}
            />,
        );

        expect(screen.getByRole("button", { name: "Cancelar" })).toBeDisabled();
        expect(screen.getByRole("button", { name: "Aprobando..." })).toBeDisabled();
    });

    it("muestra error si se recibe error", () => {
        render(
            <ConfirmApproveVacationModal
                request={request}
                error="No se pudo aprobar la solicitud"
                onCancel={vi.fn()}
                onConfirm={vi.fn()}
            />,
        );

        expect(
            screen.getByText("No se pudo aprobar la solicitud"),
        ).toBeInTheDocument();
    });

    it("usa texto genérico si no hay empleado", () => {
        render(
            <ConfirmApproveVacationModal
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
