import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import VacationWorkerDetail from "../../components/molecules/calendarCards/vacationWorkerDetail";

const baseVacation = {
    start: new Date(2026, 5, 5),
    end: new Date(2026, 5, 10),
    readableStart: new Date(2026, 5, 5),
    readableEnd: new Date(2026, 5, 10),
    totalDays: 5,
    usedDays: 4,
    status: 0,
    feedback: "",
};

const renderVacationWorkerDetail = (props = {}) => {
    const defaultProps = {
        event: baseVacation,
        onClose: vi.fn(),
        onEdit: vi.fn(),
        onDelete: vi.fn(),
    };

    render(<VacationWorkerDetail {...defaultProps} {...props} />);

    return { ...defaultProps, ...props };
};

describe("VacationWorkerDetail", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2026, 5, 1, 12));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("muestra los datos de una solicitud pendiente del trabajador", () => {
        renderVacationWorkerDetail();

        expect(screen.getByText("Solicitud de Vacaciones")).toBeInTheDocument();
        expect(screen.getByText("Fecha de Inicio:")).toBeInTheDocument();
        expect(screen.getByText("5 de junio de 2026")).toBeInTheDocument();
        expect(screen.getByText("Fecha de final:")).toBeInTheDocument();
        expect(screen.getByText("10 de junio de 2026")).toBeInTheDocument();
        expect(screen.getByText("5")).toBeInTheDocument();
        expect(screen.getByText("4")).toBeInTheDocument();
        expect(screen.getByText("Pendiente")).toBeInTheDocument();
        expect(screen.getByText("N/A")).toBeInTheDocument();
    });

    it("muestra editar y eliminar si la solicitud es futura y está pendiente", () => {
        renderVacationWorkerDetail();

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

    it("muestra eliminar y cerrar si la solicitud futura está aceptada", () => {
        renderVacationWorkerDetail({
            event: {
                ...baseVacation,
                status: 1,
                feedback: "Disfruta tus vacaciones!!",
            },
        });

        expect(screen.getByText("Aceptado")).toBeInTheDocument();
        expect(screen.getByText("Disfruta tus vacaciones!!")).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: /eliminar/i }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: /cerrar/i }),
        ).toBeInTheDocument();
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

    it("solo muestra cerrar cuando la solicitud ya está en el pasado", () => {
        renderVacationWorkerDetail({
            event: {
                ...baseVacation,
                start: new Date(2026, 4, 1),
                end: new Date(2026, 4, 5),
                readableStart: new Date(2026, 4, 1),
                readableEnd: new Date(2026, 4, 5),
            },
        });

        expect(
            screen.getByRole("button", { name: /cerrar/i }),
        ).toBeInTheDocument();
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
});
