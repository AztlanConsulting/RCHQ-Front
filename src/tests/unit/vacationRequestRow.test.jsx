import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import VacationRequestRow from "../../components/molecules/vacationRequestRow";

vi.mock("../../components/atoms/employeeAvatar", () => ({
    default: ({ fullName }) => (
        <div data-testid="avatar" aria-label={fullName} />
    ),
}));

const mockRequest = {
    vacationRequestId: "vac-001",
    startDate: "2026-05-15T00:00:00.000Z",
    endDate: "2026-05-20T00:00:00.000Z",
    usedDays: 4,
    status: 0,
    statusLabel: "Pendiente",
    employee: {
        fullName: "Ana Pendiente",
        curp: "US800101HDF00003",
        picture: null,
    },
};

const renderRow = (props = {}) => {
    const defaultProps = {
        request: mockRequest,
        view: "pending",
        approvingRequestId: null,
        onViewDetail: vi.fn(),
        onOpenApproveModal: vi.fn(),
        rejectingRequestId: null,
        onOpenRejectModal: vi.fn(),
    };

    return render(
        <table>
            <tbody>
                <VacationRequestRow
                    {...defaultProps}
                    {...props}
                />
            </tbody>
        </table>,
    );
};

describe("VacationRequestRow", () => {
    it("muestra la información principal de la solicitud", () => {
        renderRow();

        expect(screen.getByText("Ana Pendiente")).toBeInTheDocument();
        expect(screen.getByTestId("avatar")).toHaveAttribute(
            "aria-label",
            "Ana Pendiente",
        );
        expect(screen.getByText("US800101HDF00003")).toBeInTheDocument();
        expect(screen.getByText("15/05/2026")).toBeInTheDocument();
        expect(screen.getByText("20/05/2026")).toBeInTheDocument();
        expect(screen.getByText("4")).toBeInTheDocument();
    });

    it("muestra los iconos de acciones en vista pending", () => {
        renderRow();

        expect(screen.getByAltText("Ver detalle")).toBeInTheDocument();
        expect(screen.getByAltText("Aprobar solicitud")).toBeInTheDocument();
        expect(screen.getByAltText("Rechazar solicitud")).toBeInTheDocument();
    });

    it("llama onViewDetail con la solicitud al hacer click en Ver detalle", () => {
        const onViewDetail = vi.fn();

        renderRow({ onViewDetail });

        fireEvent.click(screen.getByTitle("Ver detalle"));

        expect(onViewDetail).toHaveBeenCalledTimes(1);
        expect(onViewDetail).toHaveBeenCalledWith(mockRequest);
    });

    it("llama onOpenApproveModal con la solicitud al hacer click en Aprobar", () => {
        const onOpenApproveModal = vi.fn();

        renderRow({ onOpenApproveModal });

        fireEvent.click(screen.getByTitle("Aprobar solicitud"));

        expect(onOpenApproveModal).toHaveBeenCalledTimes(1);
        expect(onOpenApproveModal).toHaveBeenCalledWith(mockRequest);
    });

    it("deshabilita el botón de aprobar cuando esa solicitud se está aprobando", () => {
        const onOpenApproveModal = vi.fn();

        renderRow({
            approvingRequestId: "vac-001",
            onOpenApproveModal,
        });

        const approveButton = screen.getByTitle("Aprobando solicitud");

        expect(approveButton).toBeDisabled();
        expect(screen.getByAltText("Aprobando solicitud")).toBeInTheDocument();

        fireEvent.click(approveButton);

        expect(onOpenApproveModal).not.toHaveBeenCalled();
    });

    it("en vista reviewed muestra el estado y oculta aprobar/rechazar", () => {
        renderRow({
            view: "reviewed",
            request: {
                ...mockRequest,
                status: 1,
                statusLabel: "Aprobada",
            },
        });

        expect(screen.getByText("Aprobada")).toBeInTheDocument();
        expect(screen.getByAltText("Ver detalle")).toBeInTheDocument();
        expect(screen.queryByAltText("Aprobar solicitud")).toBeNull();
        expect(screen.queryByAltText("Rechazar solicitud")).toBeNull();
    });

    it("usa guion cuando faltan datos del empleado o días usados", () => {
        renderRow({
            request: {
                ...mockRequest,
                usedDays: null,
                employee: {},
            },
        });

        expect(screen.getAllByText("-").length).toBeGreaterThan(0);
    });

    it("llama onOpenRejectModal con la solicitud al hacer click en Rechazar", () => {
        const onOpenRejectModal = vi.fn();

        renderRow({ onOpenRejectModal });

        fireEvent.click(screen.getByTitle("Rechazar solicitud"));

        expect(onOpenRejectModal).toHaveBeenCalledTimes(1);
        expect(onOpenRejectModal).toHaveBeenCalledWith(mockRequest);
    });

    it("deshabilita el botón de rechazar cuando esa solicitud se está rechazando", () => {
        const onOpenRejectModal = vi.fn();

        renderRow({
            rejectingRequestId: "vac-001",
            onOpenRejectModal,
        });

        const rejectButton = screen.getByTitle("Rechazando solicitud");

        expect(rejectButton).toBeDisabled();
        expect(screen.getByAltText("Rechazando solicitud")).toBeInTheDocument();

        fireEvent.click(rejectButton);

        expect(onOpenRejectModal).not.toHaveBeenCalled();
    });
});
