import {
    act,
    fireEvent,
    render,
    screen,
    waitFor,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import RegisterEventModal from "../../components/organism/evento/registerEventModal";
import {
    createPersonalEvent,
    getEventTypes,
} from "../../services/eventService";

vi.mock("../../services/eventService", () => ({
    createPersonalEvent: vi.fn(),
    getEventTypes: vi.fn(),
    getEmployeesForSelector: vi.fn(),
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

vi.mock("../../components/atoms/employeeSearchSelect", () => ({
    default: ({ label, onSelect }) => (
        <div>
            <span>{label}</span>
            <button
                type="button"
                onClick={() =>
                    onSelect({
                        employeeId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
                        employeeName: "Juan Pérez",
                    })
                }
            >
                Seleccionar Juan Pérez
            </button>
        </div>
    ),
}));

vi.mock("/absence-black.svg", () => ({ default: "absence-black.svg" }));
vi.mock("/global-black.svg", () => ({ default: "global-black.svg" }));
vi.mock("/house-black.svg", () => ({ default: "house-black.svg" }));
vi.mock("/personal-black.svg", () => ({ default: "personal-black.svg" }));
vi.mock("/vacation-black.svg", () => ({ default: "vacation-black.svg" }));
vi.mock("/time.svg", () => ({ default: "time.svg" }));
vi.mock("/chevron-down.svg", () => ({ default: "chevron-down.svg" }));

const EVENT_TYPE_ID = "11111111-1111-4111-8111-111111111111";
const EVENT_TYPE_ID_2 = "22222222-2222-4222-8222-222222222222";
const EMP_ID_1 = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

const mockEventTypes = [
    { eventTypeId: EVENT_TYPE_ID, name: "Cita médica" },
    { eventTypeId: EVENT_TYPE_ID_2, name: "Permiso personal" },
];

const mockOverlappedEmployees = [
    {
        employeeId: EMP_ID_1,
        employeeName: "Juan Pérez",
        event: {
            name: "Cita médica",
            date: "2026-05-05",
            start: "09:30:00",
            end: "10:30:00",
        },
    },
];

// Role "Empleado" makes "personal" the default visible category
const renderModal = (props = {}) => {
    const onClose = vi.fn();
    const onSuccess = vi.fn();

    render(
        <RegisterEventModal
            isOpen
            onClose={onClose}
            onSuccess={onSuccess}
            initialStartDate="2026-05-05"
            initialEndDate="2026-05-05"
            {...props}
        />,
    );

    return { onClose, onSuccess };
};

const fillBaseFields = () => {
    fireEvent.change(screen.getByPlaceholderText("Agregar título"), {
        target: { value: "Reunión de equipo" },
    });

    fireEvent.change(screen.getByRole("combobox"), {
        target: { value: EVENT_TYPE_ID },
    });
};

const selectStartTime = async (optionName) => {
    fireEvent.click(screen.getByRole("button", { name: /^inicio$/i }));
    const option = await screen.findByRole("option", { name: optionName });
    fireEvent.click(option);
};

const selectEndTime = async (optionName) => {
    fireEvent.click(screen.getByRole("button", { name: /^fin$/i }));
    const option = await screen.findByRole("option", { name: optionName });
    fireEvent.click(option);
};

const clickFormConfirm = async () => {
    await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /^confirmar$/i }));
    });
};

const clickLastConfirm = async () => {
    const confirmButtons = screen.getAllByRole("button", {
        name: /^confirmar$/i,
    });

    await act(async () => {
        fireEvent.click(confirmButtons[confirmButtons.length - 1]);
    });
};

describe("Integración: agregar evento de personal", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        localStorage.setItem("user", JSON.stringify({ role: "Empleado" }));

        getEventTypes.mockResolvedValue(mockEventTypes);

        createPersonalEvent.mockResolvedValue({
            success: true,
            data: {
                personalEventId: "evt-1",
                name: "Reunión de equipo",
            },
        });
    });

    it("obtiene y muestra los tipos de evento al abrir el modal", async () => {
        renderModal();

        await waitFor(() => {
            expect(getEventTypes).toHaveBeenCalledTimes(1);
        });

        expect(
            screen.getByRole("option", { name: /cita médica/i }),
        ).toBeInTheDocument();

        expect(
            screen.getByRole("option", { name: /permiso personal/i }),
        ).toBeInTheDocument();
    });

    it("muestra placeholder de fecha cuando abre sin fecha inicial", () => {
        renderModal({
            initialStartDate: undefined,
            initialEndDate: undefined,
        });

        expect(screen.getByLabelText("Fecha")).toHaveValue("");
        expect(screen.getByLabelText("Fecha")).toHaveAttribute(
            "placeholder",
            "dd / mm / yyyy",
        );
    });

    it("crea un evento de personal con los datos del formulario", async () => {
        const { onClose, onSuccess } = renderModal();

        await waitFor(() => {
            expect(getEventTypes).toHaveBeenCalledTimes(1);
        });

        fillBaseFields();

        fireEvent.change(
            screen.getByPlaceholderText("Agregar descripción ..."),
            { target: { value: "Discutir avances del proyecto." } },
        );

        await selectStartTime("9:00 AM");
        await selectEndTime("10:00 AM");

        await clickFormConfirm();

        await waitFor(() => {
            expect(createPersonalEvent).toHaveBeenCalledTimes(1);
        });

        expect(createPersonalEvent).toHaveBeenCalledWith({
            eventTypeId: EVENT_TYPE_ID,
            name: "Reunión de equipo",
            date: "2026-05-05",
            allDay: false,
            start: "09:00:00",
            end: "10:00:00",
            description: "Discutir avances del proyecto.",
            employeeIds: [],
            forceOverlap: false,
        });

        expect(onSuccess).toHaveBeenCalledWith({
            personalEventId: "evt-1",
            name: "Reunión de equipo",
        });

        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("muestra error si se intenta confirmar sin nombre", async () => {
        renderModal();

        await waitFor(() => {
            expect(getEventTypes).toHaveBeenCalledTimes(1);
        });

        fireEvent.change(screen.getByRole("combobox"), {
            target: { value: EVENT_TYPE_ID },
        });

        await clickFormConfirm();

        expect(
            screen.getByText("El titulo es obligatorio"),
        ).toBeInTheDocument();
        expect(createPersonalEvent).not.toHaveBeenCalled();
    });

    it("crea un evento de todo el día", async () => {
        renderModal();

        await waitFor(() => {
            expect(getEventTypes).toHaveBeenCalledTimes(1);
        });

        fillBaseFields();

        await act(async () => {
            fireEvent.click(screen.getByRole("checkbox"));
        });

        await clickFormConfirm();

        await waitFor(() => {
            expect(createPersonalEvent).toHaveBeenCalledTimes(1);
        });

        expect(createPersonalEvent).toHaveBeenCalledWith(
            expect.objectContaining({
                allDay: true,
                date: "2026-05-05",
            }),
        );
    });

    it("muestra el modal de empalme cuando el backend regresa empleados con colisiones", async () => {
        createPersonalEvent.mockResolvedValueOnce({
            success: false,
            data: { overlappedEmployees: mockOverlappedEmployees },
        });

        renderModal();

        await waitFor(() => {
            expect(getEventTypes).toHaveBeenCalledTimes(1);
        });

        fillBaseFields();

        await selectStartTime("9:00 AM");
        await selectEndTime("10:00 AM");

        await clickFormConfirm();

        await waitFor(() => {
            expect(createPersonalEvent).toHaveBeenCalledTimes(1);
        });

        expect(
            screen.getByText(
                'El empleado "Juan Pérez" tiene empalme en ese horario',
            ),
        ).toBeInTheDocument();

        expect(screen.getByText("Juan Pérez")).toBeInTheDocument();
        expect(screen.getAllByText("Cita médica").length).toBeGreaterThanOrEqual(1);
    });

    it("permite forzar el registro cuando hay empalme (coordinador)", async () => {
        createPersonalEvent
            .mockResolvedValueOnce({
                success: false,
                data: { overlappedEmployees: mockOverlappedEmployees },
            })
            .mockResolvedValueOnce({
                success: true,
                data: {
                    personalEventId: "evt-forced",
                    name: "Reunión de equipo",
                },
            });

        localStorage.setItem("user", JSON.stringify({ role: "Coordinador" }));
        const { onClose, onSuccess } = renderModal();

        await waitFor(() => {
            expect(getEventTypes).toHaveBeenCalledTimes(1);
        });

        await act(async () => {
            fireEvent.click(screen.getByRole("radio", { name: "Personal" }));
        });

        await waitFor(() =>
            screen.getByRole("button", { name: "Seleccionar Juan Pérez" }),
        );

        fireEvent.change(screen.getByPlaceholderText("Agregar título"), {
            target: { value: "Reunión de equipo" },
        });
        fireEvent.change(screen.getByRole("combobox"), {
            target: { value: EVENT_TYPE_ID },
        });
        fireEvent.click(
            screen.getByRole("button", { name: "Seleccionar Juan Pérez" }),
        );

        await selectStartTime("9:00 AM");
        await selectEndTime("10:00 AM");

        await clickFormConfirm();

        await waitFor(() => {
            expect(createPersonalEvent).toHaveBeenCalledTimes(1);
        });

        expect(
            screen.getByText(
                'El empleado "Juan Pérez" tiene empalme en ese horario',
            ),
        ).toBeInTheDocument();

        await clickLastConfirm();

        await waitFor(() => {
            expect(createPersonalEvent).toHaveBeenCalledTimes(2);
        });

        expect(createPersonalEvent).toHaveBeenLastCalledWith(
            expect.objectContaining({ forceOverlap: true }),
        );

        expect(onSuccess).toHaveBeenCalledWith({
            personalEventId: "evt-forced",
            name: "Reunión de equipo",
        });

        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("muestra error del servidor si falla createPersonalEvent", async () => {
        createPersonalEvent.mockRejectedValueOnce(
            new Error("Error al registrar evento personal"),
        );

        renderModal();

        await waitFor(() => {
            expect(getEventTypes).toHaveBeenCalledTimes(1);
        });

        fillBaseFields();

        await selectStartTime("9:00 AM");
        await selectEndTime("10:00 AM");

        await clickFormConfirm();

        await waitFor(() => {
            expect(createPersonalEvent).toHaveBeenCalledTimes(1);
        });

        expect(screen.getByRole("alert")).toHaveTextContent(
            "Error al registrar evento personal",
        );
    });
});
