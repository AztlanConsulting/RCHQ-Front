import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import VacationRequestTable from "../../components/molecules/vacationRequestTable";

vi.mock("../../components/molecules/vacationRequestRow", () => ({
    default: ({
        request,
        view,
        approvingRequestId,
        rejectingRequestId,
        onViewDetail,
        onOpenApproveModal,
        onOpenRejectModal,
    }) => (
        <tr>
            <td>{request.employee.fullName}</td>
            <td>{view}</td>
            <td>{approvingRequestId || "sin-aprobacion"}</td>
            <td>{rejectingRequestId || "sin-rechazo"}</td>
            <td>
                <button
                    type="button"
                    onClick={() => onViewDetail(request)}
                >
                    Ver mock
                </button>
                <button
                    type="button"
                    onClick={() => onOpenApproveModal(request)}
                >
                    Aprobar mock
                </button>
                <button
                    type="button"
                    onClick={() => onOpenRejectModal(request)}
                >
                    Rechazar mock
                </button>
            </td>
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
                approvingRequestId={null}
                onViewDetail={vi.fn()}
                onOpenApproveModal={vi.fn()}
                rejectingRequestId={null}
                onOpenRejectModal={vi.fn()}
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
                approvingRequestId={null}
                onViewDetail={vi.fn()}
                onOpenApproveModal={vi.fn()}
                rejectingRequestId={null}
                onOpenRejectModal={vi.fn()}
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
                approvingRequestId={null}
                onViewDetail={vi.fn()}
                onOpenApproveModal={vi.fn()}
                rejectingRequestId={null}
                onOpenRejectModal={vi.fn()}
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
                approvingRequestId={null}
                onViewDetail={vi.fn()}
                onOpenApproveModal={vi.fn()}
                rejectingRequestId={null}
                onOpenRejectModal={vi.fn()}
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
                approvingRequestId={null}
                onViewDetail={vi.fn()}
                onOpenApproveModal={vi.fn()}
                rejectingRequestId={null}
                onOpenRejectModal={vi.fn()}
            />,
        );

        expect(screen.getByText("Estado")).toBeInTheDocument();
    });

    it("pasa view y approvingRequestId al row", () => {
        render(
            <VacationRequestTable
                requests={requests}
                view="pending"
                loading={false}
                approvingRequestId="vac-001"
                onViewDetail={vi.fn()}
                onOpenApproveModal={vi.fn()}
                rejectingRequestId={null}
                onOpenRejectModal={vi.fn()}
            />,
        );

        expect(screen.getByText("pending")).toBeInTheDocument();
        expect(screen.getByText("vac-001")).toBeInTheDocument();
    });

    it("pasa onViewDetail y onOpenApproveModal al row", () => {
        const onViewDetail = vi.fn();
        const onOpenApproveModal = vi.fn();

        render(
            <VacationRequestTable
                requests={requests}
                view="pending"
                loading={false}
                approvingRequestId={null}
                onViewDetail={onViewDetail}
                onOpenApproveModal={onOpenApproveModal}
                rejectingRequestId={null}
                onOpenRejectModal={vi.fn()}
            />,
        );

        fireEvent.click(screen.getByRole("button", { name: "Ver mock" }));
        fireEvent.click(screen.getByRole("button", { name: "Aprobar mock" }));

        expect(onViewDetail).toHaveBeenCalledWith(requests[0]);
        expect(onOpenApproveModal).toHaveBeenCalledWith(requests[0]);
    });
    
    it("pasa rejectingRequestId al row", () => {
        render(
            <VacationRequestTable
                requests={requests}
                view="pending"
                loading={false}
                approvingRequestId={null}
                rejectingRequestId="vac-001"
                onViewDetail={vi.fn()}
                onOpenApproveModal={vi.fn()}
                onOpenRejectModal={vi.fn()}
            />,
        );

        expect(screen.getByText("vac-001")).toBeInTheDocument();
    });

    it("pasa onOpenRejectModal al row", () => {
        const onOpenRejectModal = vi.fn();

        render(
            <VacationRequestTable
                requests={requests}
                view="pending"
                loading={false}
                approvingRequestId={null}
                rejectingRequestId={null}
                onViewDetail={vi.fn()}
                onOpenApproveModal={vi.fn()}
                onOpenRejectModal={onOpenRejectModal}
            />,
        );

        fireEvent.click(screen.getByRole("button", { name: "Rechazar mock" }));

        expect(onOpenRejectModal).toHaveBeenCalledTimes(1);
        expect(onOpenRejectModal).toHaveBeenCalledWith(requests[0]);
    });
});
