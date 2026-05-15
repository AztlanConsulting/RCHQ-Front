import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Modal from "../../components/atoms/modal";

describe("Modal", () => {
    it("no renderiza contenido cuando open es false", () => {
        render(
            <Modal open={false} onClose={vi.fn()} title="Detalle">
                <div>Contenido</div>
            </Modal>,
        );

        expect(screen.queryByText("Contenido")).not.toBeInTheDocument();
    });

    it("renderiza el título y el contenido cuando open es true", () => {
        render(
            <Modal open onClose={vi.fn()} title="Detalle">
                <div>Contenido</div>
            </Modal>,
        );

        expect(screen.getByRole("dialog")).toBeInTheDocument();
        expect(screen.getByText("Detalle")).toBeInTheDocument();
        expect(screen.getByText("Contenido")).toBeInTheDocument();
    });

    it("llama a onClose al hacer click en el overlay", () => {
        const onClose = vi.fn();

        render(
            <Modal open onClose={onClose} title="Detalle">
                <div>Contenido</div>
            </Modal>,
        );

        const overlay = document.querySelector(".bg-black\\/50");
        fireEvent.click(overlay);

        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("llama a onClose cuando se presiona Escape", () => {
        const onClose = vi.fn();

        render(
            <Modal open onClose={onClose} title="Detalle">
                <div>Contenido</div>
            </Modal>,
        );

        fireEvent.keyDown(document, { key: "Escape" });

        expect(onClose).toHaveBeenCalledTimes(1);
    });
});
