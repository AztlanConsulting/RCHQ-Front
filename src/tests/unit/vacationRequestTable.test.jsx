import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import VacationRequestTable from "../../components/molecules/vacationRequestTable";

vi.mock("../../components/molecules/vacationRequestRow", () => ({
    default: ({ request }) => (
        <tr>
            <td>{request.employee.fullName}</td>
        </tr>
    ),
}));

const requests = [
    {
        vacationRequestId: "vac-001",
        employee: {
            fullName: "Ana Pendiente",
        },
    },
];

describe("VacationRequestTable", () => {
    it("muestra loader cuando loading=true y no hay solicitudes previas", () => {
        render(
            <VacationRequestTable
                requests={[]}
                view="pending"
                loading={true}
                onViewDetail={vi.fn()}
            />,
        );

        expect(screen.getByText("Cargando solicitudes...")).toBeInTheDocument();
    });

    it("mantiene la tabla cuando loading=true pero ya existen solicitudes", () => {
        render(
            <VacationRequestTable
                requests={requests}
                view="pending"
                loading={true}
                onViewDetail={vi.fn()}
            />,
        );

        expect(screen.getByText("Ana Pendiente")).toBeInTheDocument();
        expect(screen.queryByText("Cargando solicitudes...")).toBeNull();
    });

    it("muestra estado vacío cuando no hay solicitudes y no está cargando", () => {
        render(
            <VacationRequestTable
                requests={[]}
                view="pending"
                loading={false}
                onViewDetail={vi.fn()}
            />,
        );

        expect(
            screen.getByText("No hay solicitudes de vacaciones para mostrar"),
        ).toBeInTheDocument();
    });

    it("renderiza columnas base en vista pending", () => {
        render(
            <VacationRequestTable
                requests={requests}
                view="pending"
                loading={false}
                onViewDetail={vi.fn()}
            />,
        );

        expect(screen.getByText("Foto")).toBeInTheDocument();
        expect(screen.getByText("Nombre Completo")).toBeInTheDocument();
        expect(screen.getByText("CURP")).toBeInTheDocument();
        expect(screen.getByText("Inicio")).toBeInTheDocument();
        expect(screen.getByText("Término")).toBeInTheDocument();
        expect(screen.getByText("Días hábiles")).toBeInTheDocument();
        expect(screen.getByText("Acciones")).toBeInTheDocument();
        expect(screen.queryByText("Estado")).toBeNull();
    });

    it("renderiza columna Estado en vista reviewed", () => {
        render(
            <VacationRequestTable
                requests={requests}
                view="reviewed"
                loading={false}
                onViewDetail={vi.fn()}
            />,
        );

        expect(screen.getByText("Estado")).toBeInTheDocument();
    });
});
