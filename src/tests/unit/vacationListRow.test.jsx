import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import VacationListRow from "../../components/molecules/vacationListRow";

const PENDING_STATUS = 0;
const APPROVED_STATUS = 1;
const REJECTED_STATUS = 2;

const baseRequest = {
    vacationRequestId: "vac-001",
    startDate: "2026-06-15T00:00:00.000Z",
    endDate: "2026-06-20T00:00:00.000Z",
    usedDays: 4,
    status: PENDING_STATUS,
    statusLabel: "Pendiente",
    description: "Descanso programado",
};

const renderRow = (props = {}) => {
    const defaultProps = {
        request: baseRequest,
        view: "future",
        onViewDetail: vi.fn(),
        onEdit: vi.fn(),
        onDelete: vi.fn(),
    };

    return render(
        <table>
            <tbody>
                <VacationListRow
                    {...defaultProps}
                    {...props}
                />
            </tbody>
        </table>,
    );
};

describe("VacationListRow", () => {
    it("muestra la información principal de la vacación", () => {
        renderRow();

        expect(screen.getByText("15/06/2026")).toBeInTheDocument();
        expect(screen.getByText("20/06/2026")).toBeInTheDocument();
        expect(screen.getByText("4")).toBeInTheDocument();
        expect(screen.getByText("Pendiente")).toBeInTheDocument();
        expect(screen.getByText("Descanso programado")).toBeInTheDocument();
    });

    it("en vacaciones pasadas aprobadas no muestra edición y deja borrado deshabilitado", () => {
        renderRow({
            view: "past",
            request: {
                ...baseRequest,
                status: APPROVED_STATUS,
                statusLabel: "Aprobada",
            },
        });

        expect(screen.getByAltText("Ver detalle")).toBeInTheDocument();
        expect(screen.queryByTitle("Modificar vacación")).toBeNull();
        expect(screen.getByTitle("Borrar vacación")).toBeDisabled();
    });

    it("en vacaciones pasadas pendientes no muestra edición y deja borrado habilitado", () => {
        renderRow({
            view: "past",
            request: {
                ...baseRequest,
                status: PENDING_STATUS,
                statusLabel: "Pendiente",
            },
        });

        expect(screen.getByAltText("Ver detalle")).toBeInTheDocument();
        expect(screen.queryByTitle("Modificar vacación")).toBeNull();
        expect(screen.getByTitle("Borrar vacación")).toBeEnabled();
    });

    it("en vacaciones futuras pendientes habilita ojo, edición y borrado", () => {
        renderRow();

        expect(screen.getByAltText("Ver detalle")).toBeInTheDocument();
        expect(screen.getByTitle("Modificar vacación")).toBeEnabled();
        expect(screen.getByTitle("Borrar vacación")).toBeEnabled();
    });

    it.each([
        [APPROVED_STATUS, "Aprobada"],
        [REJECTED_STATUS, "Rechazada"],
    ])(
        "en vacaciones futuras %s deja edición deshabilitada y borrado habilitado",
        (status, statusLabel) => {
            renderRow({
                request: {
                    ...baseRequest,
                    status,
                    statusLabel,
                },
            });

            expect(screen.getByAltText("Ver detalle")).toBeInTheDocument();
            expect(screen.getByTitle("Modificar vacación")).toBeDisabled();
            expect(screen.getByTitle("Borrar vacación")).toBeEnabled();
        },
    );

    it("llama onViewDetail con la vacación al presionar Ver detalle", () => {
        const onViewDetail = vi.fn();

        renderRow({ onViewDetail });

        fireEvent.click(screen.getByTitle("Ver detalle"));

        expect(onViewDetail).toHaveBeenCalledTimes(1);
        expect(onViewDetail).toHaveBeenCalledWith(baseRequest);
    });

    it("llama onEdit y onDelete cuando las acciones están habilitadas", () => {
        const onEdit = vi.fn();
        const onDelete = vi.fn();

        renderRow({ onEdit, onDelete });

        fireEvent.click(screen.getByTitle("Modificar vacación"));
        fireEvent.click(screen.getByTitle("Borrar vacación"));

        expect(onEdit).toHaveBeenCalledWith(baseRequest);
        expect(onDelete).toHaveBeenCalledWith(baseRequest);
    });
});
