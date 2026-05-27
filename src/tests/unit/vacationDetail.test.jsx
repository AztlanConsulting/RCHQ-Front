import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../utils/authStorage", () => ({
    getStoredUser: vi.fn(),
}));

import VacationDetail from "../../components/molecules/calendarCards/vacationDetail";
import { getStoredUser } from "../../utils/authStorage";

/** Coincide con vacationDetail.jsx: canDelete / canEdit / canReview usan role === "Coordinador". */
const mockCoordinador = () =>
    vi.mocked(getStoredUser).mockReturnValue({
        role: "Coordinador",
        employeeId: "coord-test",
    });

const baseVacation = {
    employeeName: "",
    curp: "",
    start: new Date(2026, 5, 5, 12),
    end: new Date(2026, 5, 10, 12),
    readableStart: new Date(2026, 5, 5),
    readableEnd: new Date(2026, 5, 10),
    totalDays: 6,
    usedDays: 4,
    status: 0,
    feedback: "",
};

const renderVacationDetail = (props = {}) => {
    const defaultProps = {
        event: baseVacation,
        onClose: vi.fn(),
        onEdit: vi.fn(),
        onDelete: vi.fn(),
        onApprove: vi.fn(),
        onReject: vi.fn(),
    };

    render(<VacationDetail {...defaultProps} {...props} />);

    return { ...defaultProps, ...props };
};

describe("VacationDetail", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2026, 5, 1, 12));
        mockCoordinador();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("muestra los datos administrativos y fallback cuando faltan nombre y CURP", () => {
        renderVacationDetail();

        expect(screen.getByText("Solicitud de Vacaciones")).toBeInTheDocument();
        expect(screen.getByText("Nombre del trabajador")).toBeInTheDocument();
        expect(screen.getByText("CURP")).toBeInTheDocument();
        expect(screen.getAllByText("—")).toHaveLength(2);
        expect(screen.getByText("5 de junio de 2026")).toBeInTheDocument();
        expect(screen.getByText("10 de junio de 2026")).toBeInTheDocument();
        expect(screen.getByText("6")).toBeInTheDocument();
        expect(screen.getByText("4")).toBeInTheDocument();
        expect(screen.getByText("En espera")).toBeInTheDocument();
        expect(screen.queryByText("Retroalimentación:")).not.toBeInTheDocument();
        expect(
            screen.queryByText("Sin retroalimentación por el momento"),
        ).not.toBeInTheDocument();
    });

    it("muestra eliminar, editar, aprobar y rechazar si la solicitud futura está pendiente", () => {
        renderVacationDetail();

        expect(
            screen.getByRole("button", { name: /eliminar/i }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: /editar/i }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: /aprobar/i }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: /rechazar/i }),
        ).toBeInTheDocument();
        expect(
            screen.queryByRole("button", { name: /cerrar/i }),
        ).not.toBeInTheDocument();
    });

    it("muestra eliminar y editar si la solicitud futura está aceptada", () => {
        renderVacationDetail({
            event: {
                ...baseVacation,
                status: 1,
                feedback: "Disfruta tus vacaciones!!",
            },
        });

        expect(screen.getByText("Aprobadas")).toBeInTheDocument();
        expect(
            screen.getByText("Disfruta tus vacaciones!!"),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: /eliminar/i }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: /editar/i }),
        ).toBeInTheDocument();
        expect(
            screen.queryByRole("button", { name: /cerrar/i }),
        ).not.toBeInTheDocument();
        expect(
            screen.queryByRole("button", { name: /aprobar/i }),
        ).not.toBeInTheDocument();
        expect(
            screen.queryByRole("button", { name: /rechazar/i }),
        ).not.toBeInTheDocument();
    });

    it("no muestra botones de acción cuando la vacación aprobada ya está en el pasado", () => {
        renderVacationDetail({
            event: {
                ...baseVacation,
                status: 1,
                start: new Date(2026, 4, 1, 12),
                end: new Date(2026, 4, 5, 12),
                readableStart: "2026-05-01",
                readableEnd: "2026-05-05",
            },
        });

        expect(screen.getByText("Vacaciones")).toBeInTheDocument();
        expect(screen.getByText("Aprobadas")).toBeInTheDocument();

        expect(
            screen.queryByRole("button", { name: /cerrar/i }),
        ).not.toBeInTheDocument();
        expect(
            screen.queryByRole("button", { name: /eliminar/i }),
        ).not.toBeInTheDocument();
        expect(
            screen.queryByRole("button", { name: /editar/i }),
        ).not.toBeInTheDocument();
        expect(
            screen.queryByRole("button", { name: /aprobar/i }),
        ).not.toBeInTheDocument();
        expect(
            screen.queryByRole("button", { name: /rechazar/i }),
        ).not.toBeInTheDocument();
    });

    it("muestra solo eliminar cuando la solicitud pendiente ya está en el pasado", () => {
        renderVacationDetail({
            event: {
                ...baseVacation,
                status: 0,
                start: new Date(2026, 4, 1, 12),
                end: new Date(2026, 4, 5, 12),
                readableStart: "2026-05-01",
                readableEnd: "2026-05-05",
            },
        });

        expect(screen.getByText("Solicitud de Vacaciones")).toBeInTheDocument();
        expect(screen.getByText("En espera")).toBeInTheDocument();

        expect(
            screen.getByRole("button", { name: /eliminar/i }),
        ).toBeInTheDocument();
        expect(
            screen.queryByRole("button", { name: /cerrar/i }),
        ).not.toBeInTheDocument();
        expect(
            screen.queryByRole("button", { name: /editar/i }),
        ).not.toBeInTheDocument();
        expect(
            screen.queryByRole("button", { name: /aprobar/i }),
        ).not.toBeInTheDocument();
        expect(
            screen.queryByRole("button", { name: /rechazar/i }),
        ).not.toBeInTheDocument();
    });

    it("llama a onEdit al hacer click en editar", () => {
        const onEdit = vi.fn();

        renderVacationDetail({
            event: {
                ...baseVacation,
                vacationId: "vacation-1",
                employeeId: "emp-1",
                startDate: "2026-06-05",
                endDate: "2026-06-10",
                status: 1,
            },
            onEdit,
        });

        fireEvent.click(screen.getByRole("button", { name: /editar/i }));

        expect(onEdit).toHaveBeenCalledTimes(1);
    });

    it("mantiene el título de solicitud y el estilo del detalle al editar una vacación pendiente", () => {
        renderVacationDetail({
            isEditing: true,
            vacationForm: {
                startDate: "2026-06-05",
                endDate: "2026-06-10",
            },
        });

        const title = screen.getByRole("heading", {
            name: "Solicitud de Vacaciones",
        });

        expect(title).toHaveClass("mb-5", "text-[2rem]", "leading-none");
    });

    it("mantiene el título Vacaciones al editar una vacación aprobada", () => {
        renderVacationDetail({
            isEditing: true,
            event: {
                ...baseVacation,
                status: 1,
            },
            vacationForm: {
                startDate: "2026-06-05",
                endDate: "2026-06-10",
            },
        });

        expect(
            screen.getByRole("heading", { name: "Vacaciones" }),
        ).toBeInTheDocument();
    });

    it("muestra fechas actualizadas desde readableStart y readableEnd", () => {
        renderVacationDetail({
            event: {
                ...baseVacation,
                readableStart: "2026-07-01",
                readableEnd: "2026-07-03",
                startDate: "2026-07-01",
                endDate: "2026-07-03",
            },
        });

        expect(screen.getByText("1 de julio de 2026")).toBeInTheDocument();
        expect(screen.getByText("3 de julio de 2026")).toBeInTheDocument();
    });

    it("llama a onApprove al hacer click en aprobar", () => {
        const onApprove = vi.fn();
        renderVacationDetail({
            event: {
                ...baseVacation,
                status: 0,
            },
            onApprove,
        });

        fireEvent.click(screen.getByRole("button", { name: /aprobar/i }));
        expect(onApprove).toHaveBeenCalledTimes(1);
    });

    it("llama a onReject al hacer click en rechazar", () => {
        const onReject = vi.fn();
        renderVacationDetail({
            event: {
                ...baseVacation,
                status: 0,
            },
            onReject,
        });

        fireEvent.click(screen.getByRole("button", { name: /rechazar/i }));
        expect(onReject).toHaveBeenCalledTimes(1);
    });
});
