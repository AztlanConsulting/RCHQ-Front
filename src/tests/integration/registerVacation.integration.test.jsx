import {
    act,
    fireEvent,
    render,
    screen,
    waitFor,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import RegisterEventModal from "../../components/organism/evento/registerEventModal";
import { getCalendarViewerRole } from "../../services/calendarService";
import {
    getVacationEmployees,
    getRemainingVacations,
    registerEmployeeVacation,
} from "../../services/vacation.service";

vi.mock("../../services/calendarService", () => ({
    getCalendarViewerRole: vi.fn(),
}));

vi.mock("../../services/vacation.service", () => ({
    getVacationEmployees: vi.fn(),
    getRemainingVacations: vi.fn(),
    registerEmployeeVacation: vi.fn(),
}));

vi.mock("../../services/eventService", () => ({
    createHouseEvent: vi.fn(),
    getEventTypes: vi.fn().mockResolvedValue([]),
}));

vi.mock("../../components/atoms/alerts", () => ({
    default: ({ message }) => <div role="alert">{message}</div>,
}));

vi.mock("../../components/atoms/dateField", () => ({
    default: ({ label, value, onChange, placeholder }) => (
        <label>
            {label}
            <input
                aria-label={label}
                type="date"
                value={value ?? ""}
                placeholder={placeholder}
                onChange={onChange}
            />
        </label>
    ),
}));

vi.mock("/absence-black.svg", () => ({ default: "absence-black.svg" }));
vi.mock("/global-black.svg", () => ({ default: "global-black.svg" }));
vi.mock("/house-black.svg", () => ({ default: "house-black.svg" }));
vi.mock("/personal-black.svg", () => ({ default: "personal-black.svg" }));
vi.mock("/vacation-black.svg", () => ({ default: "vacation-black.svg" }));
vi.mock("/time.svg", () => ({ default: "time.svg" }));
vi.mock("/chevron-down.svg", () => ({ default: "chevron-down.svg" }));
vi.mock("/search.svg", () => ({ default: "search.svg" }));
vi.mock("/close.svg", () => ({ default: "close.svg" }));

const employees = [
    {
        employeeId: "emp-1",
        name: "Ana López",
        curp: "LOAA000101MDFXXX01",
    },
    {
        employeeId: "emp-2",
        name: "Luis Martínez",
        curp: "MALL000101HDFXXX02",
    },
];

const renderModal = (props = {}) => {
    const onClose = vi.fn();
    const onSuccess = vi.fn();
    const onFeedback = vi.fn();

    render(
        <RegisterEventModal
            isOpen
            onClose={onClose}
            onSuccess={onSuccess}
            onFeedback={onFeedback}
            initialStartDate="2026-05-05"
            initialEndDate="2026-05-07"
            {...props}
        />,
    );

    return { onClose, onSuccess, onFeedback };
};

const openVacationForm = async () => {
    fireEvent.click(screen.getByRole("radio", { name: "Vacaciones" }));

    await waitFor(() => {
        expect(getVacationEmployees).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
        expect(
            screen.getByRole("button", { name: /selecciona el empleado/i }),
        ).not.toBeDisabled();
    });
};

const selectEmployee = async (employeeName = "Ana López") => {
    fireEvent.click(
        screen.getByRole("button", { name: /selecciona el empleado/i }),
    );

    const option = await screen.findByRole("option", { name: employeeName });
    fireEvent.click(option);
};

const submitVacation = async () => {
    await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /^confirmar$/i }));
    });
};

describe("Integración: coordinador registra vacaciones desde calendario", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        getCalendarViewerRole.mockReturnValue("Coordinador");

        getVacationEmployees.mockResolvedValue(employees);

        getRemainingVacations.mockResolvedValue({
            remainingVacations: 10,
            startDate: "2026-01-01T00:00:00.000Z",
            endDate: "2026-12-31T00:00:00.000Z",
        });

        registerEmployeeVacation.mockResolvedValue({
            vacationRequestId: "vac-1",
            employeeId: "emp-1",
            status: 1,
        });
    });

    it("muestra la opción de vacaciones para el coordinador", () => {
        renderModal();

        expect(
            screen.getByRole("radio", { name: "Vacaciones" }),
        ).toBeInTheDocument();
    });

    it("oculta la opción de vacaciones para un rol no coordinador", () => {
        getCalendarViewerRole.mockReturnValue("Trabajador");

        renderModal();

        expect(
            screen.queryByRole("radio", { name: "Vacaciones" }),
        ).not.toBeInTheDocument();
    });

    it("carga empleados elegibles al abrir el formulario de vacaciones", async () => {
        renderModal();

        await openVacationForm();

        fireEvent.click(
            screen.getByRole("button", { name: /selecciona el empleado/i }),
        );

        expect(
            await screen.findByRole("option", { name: "Ana López" }),
        ).toBeInTheDocument();

        expect(
            screen.getByRole("option", { name: "Luis Martínez" }),
        ).toBeInTheDocument();
    });

    it("consulta días disponibles al seleccionar empleado", async () => {
        renderModal();

        await openVacationForm();
        await selectEmployee();

        await waitFor(() => {
            expect(getRemainingVacations).toHaveBeenCalledWith("emp-1");
        });

        expect(await screen.findByText(/días disponibles:/i)).toBeInTheDocument();
        expect(screen.getByText("10")).toBeInTheDocument();
        expect(screen.getByText(/periodo actual:/i)).toBeInTheDocument();
    });

    it("registra vacaciones con los datos del formulario", async () => {
        const { onClose, onSuccess, onFeedback } = renderModal();

        await openVacationForm();
        await selectEmployee();
        await submitVacation();

        await waitFor(() => {
            expect(registerEmployeeVacation).toHaveBeenCalledTimes(1);
        });

        expect(registerEmployeeVacation).toHaveBeenCalledWith({
            employeeId: "emp-1",
            startDate: "2026-05-05",
            endDate: "2026-05-07",
        });

        expect(onFeedback).toHaveBeenCalledWith({
            type: "success",
            message: "Vacaciones registradas correctamente",
        });

        expect(onSuccess).toHaveBeenCalledTimes(1);
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("muestra errores y no envía si faltan campos obligatorios", async () => {
        renderModal({
            initialStartDate: "",
            initialEndDate: "",
        });

        await openVacationForm();
        await submitVacation();

        expect(screen.getByText("Selecciona un empleado")).toBeInTheDocument();
        expect(
            screen.getByText("Selecciona la fecha de inicio"),
        ).toBeInTheDocument();
        expect(screen.getByText("Selecciona la fecha de fin")).toBeInTheDocument();

        expect(registerEmployeeVacation).not.toHaveBeenCalled();
    });

    it("muestra error y no envía si la fecha de inicio es posterior a la fecha de fin", async () => {
        renderModal({
            initialStartDate: "2026-05-10",
            initialEndDate: "2026-05-07",
        });

        await openVacationForm();
        await selectEmployee();
        await submitVacation();

        expect(
            screen.getByText(
                "La fecha de inicio no puede ser posterior a la fecha de fin",
            ),
        ).toBeInTheDocument();

        expect(registerEmployeeVacation).not.toHaveBeenCalled();
    });

    it("muestra error del backend si falla el registro", async () => {
        const { onClose, onSuccess } = renderModal();

        registerEmployeeVacation.mockRejectedValueOnce(
            new Error("No hay días suficientes"),
        );

        await openVacationForm();
        await selectEmployee();
        await submitVacation();

        expect(await screen.findByRole("alert")).toHaveTextContent(
            "No hay días suficientes",
        );

        expect(onSuccess).not.toHaveBeenCalled();
        expect(onClose).not.toHaveBeenCalled();
    });
});
