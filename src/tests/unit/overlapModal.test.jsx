import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import OverlapModal from "../../components/organism/overlapModal";

describe("OverlapModal", () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    const collisions = [
        {
            houseEventId: "event-1",
            name: "Junta semanal",
            start: "2026-05-15T09:00:00.000Z",
            end: "2026-05-15T10:00:00.000Z",
        },
        {
            houseEventId: "event-2",
            name: "Revisión casa",
            start: "2026-05-15T11:00:00.000Z",
            end: "2026-05-15T12:00:00.000Z",
        },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("no debe renderizar el modal si isOpen es false", () => {
        render(
            <OverlapModal
                isOpen={false}
                collisions={collisions}
                onConfirm={onConfirm}
                onCancel={onCancel}
            />,
        );

        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("debe renderizar el modal cuando isOpen es true", () => {
        render(
            <OverlapModal
                isOpen
                collisions={collisions}
                onConfirm={onConfirm}
                onCancel={onCancel}
            />,
        );

        expect(screen.getByRole("dialog")).toBeInTheDocument();
        expect(
            screen.getByText(/se empalma con 2 eventos/i),
        ).toBeInTheDocument();
    });

    it("debe mostrar mensaje singular cuando hay una sola colisión", () => {
        render(
            <OverlapModal
                isOpen
                collisions={[collisions[0]]}
                onConfirm={onConfirm}
                onCancel={onCancel}
            />,
        );

        expect(
            screen.getByText(/se empalma con “Junta semanal”/i),
        ).toBeInTheDocument();
    });

    it("debe mostrar otro evento si la colisión no tiene nombre", () => {
        render(
            <OverlapModal
                isOpen
                collisions={[
                    {
                        houseEventId: "event-1",
                        start: "2026-05-15T09:00:00.000Z",
                        end: "2026-05-15T10:00:00.000Z",
                    },
                ]}
                onConfirm={onConfirm}
                onCancel={onCancel}
            />,
        );

        expect(
            screen.getByText(/se empalma con “otro evento”/i),
        ).toBeInTheDocument();
    });

    it("debe renderizar la lista de colisiones", () => {
        render(
            <OverlapModal
                isOpen
                collisions={collisions}
                onConfirm={onConfirm}
                onCancel={onCancel}
            />,
        );

        expect(screen.getByText("Junta semanal")).toBeInTheDocument();
        expect(screen.getByText("Revisión casa")).toBeInTheDocument();
    });

    it("debe renderizar los botones Confirmar y Cancelar", () => {
        render(
            <OverlapModal
                isOpen
                collisions={collisions}
                onConfirm={onConfirm}
                onCancel={onCancel}
            />,
        );

        expect(
            screen.getByRole("button", { name: /confirmar/i }),
        ).toBeInTheDocument();

        expect(
            screen.getByRole("button", { name: /cancelar/i }),
        ).toBeInTheDocument();
    });

    it("debe llamar onConfirm al presionar Confirmar", () => {
        render(
            <OverlapModal
                isOpen
                collisions={collisions}
                onConfirm={onConfirm}
                onCancel={onCancel}
            />,
        );

        fireEvent.click(screen.getByRole("button", { name: /confirmar/i }));

        expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it("debe llamar onCancel al presionar Cancelar", () => {
        render(
            <OverlapModal
                isOpen
                collisions={collisions}
                onConfirm={onConfirm}
                onCancel={onCancel}
            />,
        );

        fireEvent.click(screen.getByRole("button", { name: /cancelar/i }));

        expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it("debe mostrar Registrando... y deshabilitar botones cuando isLoading es true", () => {
        render(
            <OverlapModal
                isOpen
                collisions={collisions}
                onConfirm={onConfirm}
                onCancel={onCancel}
                isLoading
            />,
        );

        const confirmButton = screen.getByRole("button", {
            name: /registrando/i,
        });

        const cancelButton = screen.getByRole("button", {
            name: /cancelar/i,
        });

        expect(confirmButton).toBeDisabled();
        expect(cancelButton).toBeDisabled();
    });
});
