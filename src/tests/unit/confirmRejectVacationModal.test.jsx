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

    it("muestra la información de confirmación y el campo de retroalimentación", () => {
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
        expect(
            screen.getByLabelText("Motivo del rechazo (opcional)"),
        ).toBeInTheDocument();
        expect(screen.getByText("0/500")).toBeInTheDocument();
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

    it("llama onConfirm con feedback vacío al presionar Rechazar sin escribir retroalimentación", () => {
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
        expect(onConfirm).toHaveBeenCalledWith("");
    });

    it("llama onConfirm con la retroalimentación escrita", () => {
        const onConfirm = vi.fn();

        render(
            <ConfirmRejectVacationModal
                request={request}
                onCancel={vi.fn()}
                onConfirm={onConfirm}
            />,
        );

        fireEvent.change(screen.getByLabelText("Motivo del rechazo (opcional)"), {
            target: { value: "No hay disponibilidad para esas fechas" },
        });

        fireEvent.click(screen.getByRole("button", { name: "Rechazar" }));

        expect(onConfirm).toHaveBeenCalledTimes(1);
        expect(onConfirm).toHaveBeenCalledWith(
            "No hay disponibilidad para esas fechas",
        );
    });

    it("actualiza el contador de caracteres de la retroalimentación", () => {
        render(
            <ConfirmRejectVacationModal
                request={request}
                onCancel={vi.fn()}
                onConfirm={vi.fn()}
            />,
        );

        fireEvent.change(screen.getByLabelText("Motivo del rechazo (opcional)"), {
            target: { value: "Motivo" },
        });

        expect(screen.getByText("6/500")).toBeInTheDocument();
    });

    it("permite escribir acentos, signos permitidos y emojis en la retroalimentación", () => {
        const onConfirm = vi.fn();
        const feedback =
            'No procede por días: razón #1 ¿ok? 50% + ajuste_2 ~= "sí" ° 🙂👩🏽‍💻🇲🇽';

        render(
            <ConfirmRejectVacationModal
                request={request}
                onCancel={vi.fn()}
                onConfirm={onConfirm}
            />,
        );

        fireEvent.change(screen.getByLabelText("Motivo del rechazo (opcional)"), {
            target: { value: feedback },
        });

        expect(
            screen.getByLabelText("Motivo del rechazo (opcional)"),
        ).toHaveValue(feedback);

        fireEvent.click(screen.getByRole("button", { name: "Rechazar" }));

        expect(onConfirm).toHaveBeenCalledWith(feedback);
    });

    it("muestra error al confirmar si la retroalimentación tiene caracteres no permitidos", () => {
        const onConfirm = vi.fn();

        render(
            <ConfirmRejectVacationModal
                request={request}
                onCancel={vi.fn()}
                onConfirm={onConfirm}
            />,
        );

        fireEvent.change(screen.getByLabelText("Motivo del rechazo (opcional)"), {
            target: { value: "No procede @ por fechas" },
        });

        expect(
            screen.getByLabelText("Motivo del rechazo (opcional)"),
        ).toHaveValue("No procede @ por fechas");

        fireEvent.click(screen.getByRole("button", { name: "Rechazar" }));

        expect(onConfirm).not.toHaveBeenCalled();
        expect(
            screen.getByText(
                "La retroalimentación solo puede contener letras, números, emojis, espacios y signos permitidos",
            ),
        ).toBeInTheDocument();
    });

    it("muestra estado loading y deshabilita botones y textarea", () => {
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
        expect(
            screen.getByLabelText("Motivo del rechazo (opcional)"),
        ).toBeDisabled();
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
