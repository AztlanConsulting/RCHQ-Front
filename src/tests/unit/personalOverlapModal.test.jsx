import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import PersonalOverlapModal from "../../components/organism/personalOverlapModal";

vi.mock("../../components/atoms/button", () => ({
    default: ({ text, onClick, disabled }) => (
        <button type="button" onClick={onClick} disabled={disabled}>
            {text}
        </button>
    ),
}));

describe("PersonalOverlapModal", () => {
    const overlappedEmployees = [
        {
            employeeId: "emp-1",
            employeeName: "Juan Pérez",
            event: {
                name: "Cita médica",
                date: "2026-04-09",
                start: "10:00:00",
                end: "11:30:00",
            },
        },
        {
            employeeId: "emp-2",
            employeeName: "María López",
            event: {
                name: "Permiso personal",
                date: "2026-04-09",
                start: "12:00:00",
                end: "13:00:00",
            },
        },
    ];

    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("no renderiza nada cuando isOpen es false", () => {
        render(
            <PersonalOverlapModal
                isOpen={false}
                overlappedEmployees={overlappedEmployees}
                onConfirm={onConfirm}
                onCancel={onCancel}
            />,
        );

        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("renderiza el modal cuando isOpen es true", () => {
        render(
            <PersonalOverlapModal
                isOpen
                overlappedEmployees={overlappedEmployees}
                onConfirm={onConfirm}
                onCancel={onCancel}
            />,
        );

        expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("muestra mensaje singular cuando solo hay un empleado con empalme", () => {
        render(
            <PersonalOverlapModal
                isOpen
                overlappedEmployees={[overlappedEmployees[0]]}
                onConfirm={onConfirm}
                onCancel={onCancel}
            />,
        );

        expect(
            screen.getByText(
                'El empleado "Juan Pérez" tiene empalme en ese horario',
            ),
        ).toBeInTheDocument();
    });

    it("muestra mensaje plural cuando hay varios empleados con empalme", () => {
        render(
            <PersonalOverlapModal
                isOpen
                overlappedEmployees={overlappedEmployees}
                onConfirm={onConfirm}
                onCancel={onCancel}
            />,
        );

        expect(
            screen.getByText("2 empleados tienen empalme en ese horario"),
        ).toBeInTheDocument();
    });

    it("muestra la información de los empleados y eventos empalmados", () => {
        render(
            <PersonalOverlapModal
                isOpen
                overlappedEmployees={overlappedEmployees}
                onConfirm={onConfirm}
                onCancel={onCancel}
            />,
        );

        expect(screen.getByText("Juan Pérez")).toBeInTheDocument();
        expect(screen.getByText("Cita médica")).toBeInTheDocument();
        expect(screen.getByText("María López")).toBeInTheDocument();
        expect(screen.getByText("Permiso personal")).toBeInTheDocument();

        expect(screen.getByText(/10:00/)).toBeInTheDocument();
        expect(screen.getByText(/11:30/)).toBeInTheDocument();
        expect(screen.getByText(/12:00/)).toBeInTheDocument();
        expect(screen.getByText(/13:00/)).toBeInTheDocument();
    });

    it("no muestra botón Confirmar si no es coordinador", () => {
        render(
            <PersonalOverlapModal
                isOpen
                isCoordinator={false}
                overlappedEmployees={overlappedEmployees}
                onConfirm={onConfirm}
                onCancel={onCancel}
            />,
        );

        expect(
            screen.queryByRole("button", { name: "Confirmar" }),
        ).not.toBeInTheDocument();

        expect(
            screen.getByRole("button", { name: "Cancelar" }),
        ).toBeInTheDocument();
    });

    it("muestra botón Confirmar y mensaje si es coordinador", () => {
        render(
            <PersonalOverlapModal
                isOpen
                isCoordinator
                overlappedEmployees={overlappedEmployees}
                onConfirm={onConfirm}
                onCancel={onCancel}
            />,
        );

        expect(
            screen.getByText("¿Deseas registrar el evento de todas formas?"),
        ).toBeInTheDocument();

        expect(
            screen.getByRole("button", { name: "Confirmar" }),
        ).toBeInTheDocument();
    });

    it("llama a onConfirm al presionar Confirmar", () => {
        render(
            <PersonalOverlapModal
                isOpen
                isCoordinator
                overlappedEmployees={overlappedEmployees}
                onConfirm={onConfirm}
                onCancel={onCancel}
            />,
        );

        fireEvent.click(screen.getByRole("button", { name: "Confirmar" }));

        expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it("llama a onCancel al presionar Cancelar", () => {
        render(
            <PersonalOverlapModal
                isOpen
                overlappedEmployees={overlappedEmployees}
                onConfirm={onConfirm}
                onCancel={onCancel}
            />,
        );

        fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));

        expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it("deshabilita botones cuando isLoading es true", () => {
        render(
            <PersonalOverlapModal
                isOpen
                isCoordinator
                isLoading
                overlappedEmployees={overlappedEmployees}
                onConfirm={onConfirm}
                onCancel={onCancel}
            />,
        );

        expect(
            screen.getByRole("button", { name: "Registrando..." }),
        ).toBeDisabled();

        expect(screen.getByRole("button", { name: "Cancelar" })).toBeDisabled();
    });

    it("usa texto por defecto si el empleado no tiene nombre", () => {
        render(
            <PersonalOverlapModal
                isOpen
                overlappedEmployees={[
                    {
                        employeeId: "emp-1",
                        employeeName: undefined,
                        event: {
                            name: "Evento personal",
                            date: "2026-04-09",
                            start: "09:00:00",
                            end: "10:00:00",
                        },
                    },
                ]}
                onConfirm={onConfirm}
                onCancel={onCancel}
            />,
        );

        expect(
            screen.getByText(
                'El empleado "un empleado" tiene empalme en ese horario',
            ),
        ).toBeInTheDocument();
    });
});
