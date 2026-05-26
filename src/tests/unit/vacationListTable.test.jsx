import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import VacationListTable from "../../components/molecules/vacationListTable";

vi.mock("../../components/molecules/vacationListRow", () => ({
    default: ({ request, view, onViewDetail, onEdit, onDelete }) => (
        <tr>
            <td>{request.description}</td>
            <td>{view}</td>
            <td>
                <button
                    type="button"
                    onClick={() => onViewDetail(request)}
                >
                    Ver mock
                </button>
                <button
                    type="button"
                    onClick={() => onEdit(request)}
                >
                    Editar mock
                </button>
                <button
                    type="button"
                    onClick={() => onDelete(request)}
                >
                    Borrar mock
                </button>
            </td>
        </tr>
    ),
}));

const requests = [
    {
        vacationRequestId: "vac-001",
        description: "Vacación futura",
    },
];

describe("VacationListTable", () => {
    it("muestra loader cuando loading=true y no hay vacaciones previas", () => {
        render(
            <VacationListTable
                requests={[]}
                view="future"
                loading={true}
                onViewDetail={vi.fn()}
            />,
        );

        expect(screen.getByText("Cargando vacaciones...")).toBeInTheDocument();
    });

    it("mantiene la tabla cuando loading=true pero ya existen vacaciones", () => {
        render(
            <VacationListTable
                requests={requests}
                view="future"
                loading={true}
                onViewDetail={vi.fn()}
            />,
        );

        expect(screen.getByText("Vacación futura")).toBeInTheDocument();
        expect(screen.queryByText("Cargando vacaciones...")).toBeNull();
    });

    it("muestra estado vacío cuando no hay vacaciones y no está cargando", () => {
        render(
            <VacationListTable
                requests={[]}
                view="future"
                loading={false}
                onViewDetail={vi.fn()}
            />,
        );

        expect(screen.getByText("No hay vacaciones para mostrar")).toBeInTheDocument();
    });

    it("renderiza las columnas de la lista personal", () => {
        render(
            <VacationListTable
                requests={requests}
                view="future"
                loading={false}
                onViewDetail={vi.fn()}
            />,
        );

        expect(screen.getByText("Día de inicio")).toBeInTheDocument();
        expect(screen.getByText("Día de término")).toBeInTheDocument();
        expect(screen.getByText("Días hábiles")).toBeInTheDocument();
        expect(screen.getByText("Estado")).toBeInTheDocument();
        expect(screen.getByText("Descripción")).toBeInTheDocument();
        expect(screen.getByText("Acciones")).toBeInTheDocument();
    });

    it("pasa view y acciones al row", () => {
        const onViewDetail = vi.fn();
        const onEdit = vi.fn();
        const onDelete = vi.fn();

        render(
            <VacationListTable
                requests={requests}
                view="past"
                loading={false}
                onViewDetail={onViewDetail}
                onEdit={onEdit}
                onDelete={onDelete}
            />,
        );

        expect(screen.getByText("past")).toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: "Ver mock" }));

        expect(onViewDetail).toHaveBeenCalledTimes(1);
        expect(onViewDetail).toHaveBeenCalledWith(requests[0]);

        fireEvent.click(screen.getByRole("button", { name: "Editar mock" }));
        fireEvent.click(screen.getByRole("button", { name: "Borrar mock" }));

        expect(onEdit).toHaveBeenCalledWith(requests[0]);
        expect(onDelete).toHaveBeenCalledWith(requests[0]);
    });
});
