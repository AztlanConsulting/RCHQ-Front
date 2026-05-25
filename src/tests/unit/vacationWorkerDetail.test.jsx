import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import VacationWorkerDetail from "../../components/molecules/calendarCards/vacationWorkerDetail";

vi.mock("../../components/atoms/dateField", () => ({
    default: ({ label, name, value = "", onChange }) => (
        <label>
            {label}
            <input
                aria-label={label}
                name={name}
                value={value}
                onChange={onChange}
            />
        </label>
    ),
}));

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
        expect(screen.getByText("Fecha de inicio:")).toBeInTheDocument();
        expect(screen.getByText("5 de junio de 2026")).toBeInTheDocument();
        expect(screen.getByText("Fecha de fin:")).toBeInTheDocument();
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

    it("solo muestra cerrar cuando la solicitud aprobada ya está en el pasado", () => {
        renderVacationWorkerDetail({
            event: {
                ...baseVacation,
                start: new Date(2026, 4, 1),
                end: new Date(2026, 4, 5),
                readableStart: new Date(2026, 4, 1),
                readableEnd: new Date(2026, 4, 5),
                status: 1,
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

    it("muestra eliminar para una solicitud rechazada pasada", () => {
        renderVacationWorkerDetail({
            event: {
                ...baseVacation,
                start: new Date(2026, 4, 1),
                end: new Date(2026, 4, 5),
                readableStart: new Date(2026, 4, 1),
                readableEnd: new Date(2026, 4, 5),
                status: 2,
                feedback: "No procede",
            },
        });

        expect(screen.getByText("Rechazado")).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: /eliminar/i }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: /cerrar/i }),
        ).toBeInTheDocument();
        expect(
            screen.queryByRole("button", { name: /editar/i }),
        ).not.toBeInTheDocument();
    });

    it("ejecuta onDelete al presionar eliminar", () => {
        const { onDelete } = renderVacationWorkerDetail();

        fireEvent.click(screen.getByRole("button", { name: /eliminar/i }));

        expect(onDelete).toHaveBeenCalledTimes(1);
    });

    it("muestra el formulario de edición sin datos del empleado y con sus fechas", () => {
        renderVacationWorkerDetail({
            isEditing: true,
            vacationForm: {
                startDate: "2026-06-05",
                endDate: "2026-06-10",
            },
            vacationRemainingInfo: {
                remainingVacations: 8,
                startDate: "2026-04-09T00:00:00.000Z",
                endDate: "2027-04-08T00:00:00.000Z",
            },
            onCancelEdit: vi.fn(),
            onSubmitEdit: vi.fn(),
            onVacationFieldChange: vi.fn(),
        });

        expect(screen.queryByText("Nombre del trabajador")).not.toBeInTheDocument();
        expect(screen.queryByText("CURP")).not.toBeInTheDocument();
        expect(screen.getByLabelText("Fecha de inicio")).toHaveValue("2026-06-05");
        expect(screen.getByLabelText("Fecha de fin")).toHaveValue("2026-06-10");
        expect(screen.getByRole("button", { name: /cancelar/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /guardar/i })).toBeInTheDocument();
    });
});

