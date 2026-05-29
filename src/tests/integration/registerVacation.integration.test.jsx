import {
    act,
    fireEvent,
    render,
    screen,
    waitFor,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import RegisterEventModal from "../../components/organism/evento/registerEventModal";
import { formatDateOnly } from "../../utils/vacationDateRange";
import {
    getCalendarViewerRole,
    getOwnEmployeeId,
} from "../../services/calendarService";
import {
    getVacationEmployees,
    getRemainingVacations,
    registerEmployeeVacation,
    requestEmployeeVacation,
} from "../../services/vacationService";

vi.mock("../../services/calendarService", () => ({
    getCalendarViewerRole: vi.fn(),
    getOwnEmployeeId: vi.fn(),
}));

vi.mock("../../services/vacationService", () => ({
    getVacationEmployees: vi.fn(),
    getRemainingVacations: vi.fn(),
    registerEmployeeVacation: vi.fn(),
    requestEmployeeVacation: vi.fn(),
}));

vi.mock("../../services/eventService", () => ({
    createHouseEvent: vi.fn(),
    getEventTypes: vi.fn().mockResolvedValue([]),
}));

vi.mock("../../utils/timeZone", async (importOriginal) => {
    const actual = await importOriginal();

    return {
        ...actual,
        isMexicoTimeZone: vi.fn(() => false),
    };
});

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

const renderModal = async (props = {}) => {
    const onClose = vi.fn();
    const onSuccess = vi.fn();
    const onFeedback = vi.fn();

    await act(async () => {
        render(
            <RegisterEventModal
                isOpen
                onClose={onClose}
                onSuccess={onSuccess}
                onFeedback={onFeedback}
                initialStartDate="2026-05-05"
                initialEndDate="2026-05-07"
                calendarTimeZoneMode="local"
                canSwitchCalendarTimeZone
                {...props}
            />,
        );
    });

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

const openWorkerVacationForm = async (employeeId = "own-employee") => {
    fireEvent.click(screen.getByRole("radio", { name: "Vacaciones" }));

    await waitFor(() => {
        expect(getRemainingVacations).toHaveBeenCalledWith(employeeId);
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
        getOwnEmployeeId.mockReturnValue("own-employee");

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

    it("muestra la opción de vacaciones para el coordinador", async () => {
        await renderModal();

        expect(
            screen.getByRole("radio", { name: "Vacaciones" }),
        ).toBeInTheDocument();
    });

    it("carga empleados elegibles al abrir el formulario de vacaciones", async () => {
        await renderModal();

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
        await renderModal();

        await openVacationForm();
        await selectEmployee();

        await waitFor(() => {
            expect(getRemainingVacations).toHaveBeenCalledWith("emp-1");
        });

        expect(await screen.findByText(/días disponibles:/i)).toBeInTheDocument();
        expect(screen.getByText("10")).toBeInTheDocument();
        expect(screen.getByText(/periodo actual:/i)).toBeInTheDocument();
    });

    it("muestra el mensaje de horario central de México al crear vacaciones desde zona foránea", async () => {
        await renderModal();

        await openVacationForm();

        expect(
            screen.getByText(/las vacaciones se guardan con base en horario central de/i),
        ).toBeInTheDocument();
    });

    it("registra vacaciones con los datos del formulario", async () => {
        const { onClose, onSuccess, onFeedback } = await renderModal();

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
        await renderModal({
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
        await renderModal({
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
        const { onClose, onSuccess } = await renderModal();

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

describe("Integración: trabajador solicita vacaciones desde calendario", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        getCalendarViewerRole.mockReturnValue("Trabajador");
        getOwnEmployeeId.mockReturnValue("own-employee");

        getVacationEmployees.mockResolvedValue([]);

        getRemainingVacations.mockResolvedValue({
            remainingVacations: 6,
            startDate: "2026-01-01T00:00:00.000Z",
            endDate: "2026-12-31T00:00:00.000Z",
        });

        requestEmployeeVacation.mockResolvedValue({
            vacationRequestId: "vac-request-1",
            employeeId: "own-employee",
            status: 0,
        });
    });

    it("muestra la opción de vacaciones para el trabajador", async () => {
        await renderModal();

        expect(
            screen.getByRole("radio", { name: "Vacaciones" }),
        ).toBeInTheDocument();
    });

    it("consulta días disponibles del empleado de la sesión al abrir vacaciones", async () => {
        await renderModal();

        await openWorkerVacationForm();

        expect(getVacationEmployees).not.toHaveBeenCalled();
        expect(getRemainingVacations).toHaveBeenCalledWith("own-employee");
        expect(await screen.findByText(/días disponibles:/i)).toBeInTheDocument();
        expect(screen.getByText("6")).toBeInTheDocument();
        expect(screen.getByText(/periodo actual:/i)).toBeInTheDocument();
    });

    it("solicita vacaciones con los datos del formulario", async () => {
        const { onClose, onSuccess, onFeedback } = await renderModal();

        await openWorkerVacationForm();

        expect(
            screen.queryByRole("button", { name: /selecciona el empleado/i }),
        ).not.toBeInTheDocument();
        expect(getVacationEmployees).not.toHaveBeenCalled();
        expect(getRemainingVacations).toHaveBeenCalledWith("own-employee");

        await submitVacation();

        await waitFor(() => {
            expect(requestEmployeeVacation).toHaveBeenCalledTimes(1);
        });

        expect(requestEmployeeVacation).toHaveBeenCalledWith({
            employeeId: "own-employee",
            startDate: "2026-05-05",
            endDate: "2026-05-07",
        });
        expect(registerEmployeeVacation).not.toHaveBeenCalled();

        expect(onFeedback).toHaveBeenCalledWith({
            type: "success",
            message: "Vacaciones solicitadas correctamente",
        });
        expect(onSuccess).toHaveBeenCalledTimes(1);
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("muestra validación local si la fecha de inicio es posterior a la fecha de fin", async () => {
        await renderModal({
            initialStartDate: "2026-05-10",
            initialEndDate: "2026-05-07",
        });

        await openWorkerVacationForm();
        await submitVacation();

        expect(
            screen.getByText(
                "La fecha de inicio no puede ser posterior a la fecha de fin",
            ),
        ).toBeInTheDocument();

        expect(requestEmployeeVacation).not.toHaveBeenCalled();
    });

    it("muestra validación local si las fechas tienen formato inválido", async () => {
        await renderModal({
            initialStartDate: "2026-6-1",
            initialEndDate: "2026-06-03",
        });

        await openWorkerVacationForm();
        await submitVacation();

        expect(screen.getByText("Selecciona una fecha válida")).toBeInTheDocument();
        expect(requestEmployeeVacation).not.toHaveBeenCalled();
    });

    it("muestra error del backend si el empleado no tiene días de trabajo registrados", async () => {
        getOwnEmployeeId.mockReturnValue("worker-without-workdays");
        const { onClose, onSuccess } = await renderModal();
        const message = "Se necesitan tener registrados los días de trabajo";

        requestEmployeeVacation.mockImplementation(async ({ employeeId }) => {
            if (employeeId === "worker-without-workdays") {
                throw new Error(message);
            }

            return null;
        });

        await openWorkerVacationForm("worker-without-workdays");
        await submitVacation();

        await waitFor(() => {
            expect(requestEmployeeVacation).toHaveBeenCalledTimes(1);
        });

        expect(requestEmployeeVacation).toHaveBeenCalledWith({
            employeeId: "worker-without-workdays",
            startDate: "2026-05-05",
            endDate: "2026-05-07",
        });
        expect(await screen.findByRole("alert")).toHaveTextContent(message);

        expect(onSuccess).not.toHaveBeenCalled();
        expect(onClose).not.toHaveBeenCalled();
    });

    it("muestra error del backend si las vacaciones están fuera del periodo laboral", async () => {
        const { onClose, onSuccess } = await renderModal({
            initialStartDate: "2027-01-05",
            initialEndDate: "2027-01-07",
        });
        const message =
            "No se pueden solicitar vacaciones fuera del periodo actual de trabajo";

        requestEmployeeVacation.mockImplementation(async ({ startDate, endDate }) => {
            if (startDate === "2027-01-05" && endDate === "2027-01-07") {
                throw new Error(message);
            }

            return null;
        });

        await openWorkerVacationForm();
        await submitVacation();

        await waitFor(() => {
            expect(requestEmployeeVacation).toHaveBeenCalledWith({
                employeeId: "own-employee",
                startDate: "2027-01-05",
                endDate: "2027-01-07",
            });
        });
        expect(await screen.findByRole("alert")).toHaveTextContent(message);

        expect(onSuccess).not.toHaveBeenCalled();
        expect(onClose).not.toHaveBeenCalled();
    });

    it("muestra error del backend si las vacaciones son en el pasado o el mismo día", async () => {
        const currentDate = formatDateOnly(new Date());
        const { onClose, onSuccess } = await renderModal({
            initialStartDate: currentDate,
            initialEndDate: currentDate,
        });
        const message =
            "No se pueden pedir vacaciones en el pasado ni para el mismo día";

        requestEmployeeVacation.mockImplementation(async ({ startDate, endDate }) => {
            if (startDate === currentDate && endDate === currentDate) {
                throw new Error(message);
            }

            return null;
        });

        await openWorkerVacationForm();
        await submitVacation();

        await waitFor(() => {
            expect(requestEmployeeVacation).toHaveBeenCalledWith({
                employeeId: "own-employee",
                startDate: currentDate,
                endDate: currentDate,
            });
        });
        expect(await screen.findByRole("alert")).toHaveTextContent(message);

        expect(onSuccess).not.toHaveBeenCalled();
        expect(onClose).not.toHaveBeenCalled();
    });

    it("muestra error del backend si el rango no contiene días hábiles de vacaciones", async () => {
        const { onClose, onSuccess } = await renderModal({
            initialStartDate: "2026-06-06",
            initialEndDate: "2026-06-07",
        });
        const message =
            "Dentro del rango seleccionado no hay ningún día hábil de vacaciones";

        requestEmployeeVacation.mockImplementation(async ({ startDate, endDate }) => {
            if (startDate === "2026-06-06" && endDate === "2026-06-07") {
                throw new Error(message);
            }

            return null;
        });

        await openWorkerVacationForm();
        await submitVacation();

        await waitFor(() => {
            expect(requestEmployeeVacation).toHaveBeenCalledWith({
                employeeId: "own-employee",
                startDate: "2026-06-06",
                endDate: "2026-06-07",
            });
        });
        expect(await screen.findByRole("alert")).toHaveTextContent(message);

        expect(onSuccess).not.toHaveBeenCalled();
        expect(onClose).not.toHaveBeenCalled();
    });

    it("muestra error del backend si no hay suficientes días disponibles", async () => {
        const { onClose, onSuccess } = await renderModal({
            initialStartDate: "2026-06-01",
            initialEndDate: "2026-06-30",
        });
        const message =
            "No se tienen suficientes días disponibles para solicitar las vacaciones";

        requestEmployeeVacation.mockImplementation(async ({ startDate, endDate }) => {
            if (startDate === "2026-06-01" && endDate === "2026-06-30") {
                throw new Error(message);
            }

            return null;
        });

        await openWorkerVacationForm();
        await submitVacation();

        await waitFor(() => {
            expect(requestEmployeeVacation).toHaveBeenCalledWith({
                employeeId: "own-employee",
                startDate: "2026-06-01",
                endDate: "2026-06-30",
            });
        });
        expect(await screen.findByRole("alert")).toHaveTextContent(message);

        expect(onSuccess).not.toHaveBeenCalled();
        expect(onClose).not.toHaveBeenCalled();
    });

    it("muestra error del backend si ya hay una solicitud cubriendo los días", async () => {
        const { onClose, onSuccess } = await renderModal({
            initialStartDate: "2026-07-01",
            initialEndDate: "2026-07-03",
        });
        const message =
            "Ya hay una solicitud de vacaciones cubriendo los días solicitados";

        requestEmployeeVacation.mockImplementation(async ({ startDate, endDate }) => {
            if (startDate === "2026-07-01" && endDate === "2026-07-03") {
                throw new Error(message);
            }

            return null;
        });

        await openWorkerVacationForm();
        await submitVacation();

        await waitFor(() => {
            expect(requestEmployeeVacation).toHaveBeenCalledWith({
                employeeId: "own-employee",
                startDate: "2026-07-01",
                endDate: "2026-07-03",
            });
        });
        expect(await screen.findByRole("alert")).toHaveTextContent(message);

        expect(onSuccess).not.toHaveBeenCalled();
        expect(onClose).not.toHaveBeenCalled();
    });
});
