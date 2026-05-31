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
import {
    getBrowserTimeZone,
    MEXICO_TIME_ZONE,
    zonedDateTimeToIso,
} from "../../utils/timeZone";

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

const _d = new Date();
const TODAY = `${_d.getFullYear()}-${String(_d.getMonth() + 1).padStart(2, "0")}-${String(_d.getDate()).padStart(2, "0")}`;
const addDaysToLocalDateOnly = (dateValue, days) => {
    const [year, month, day] = dateValue.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    date.setDate(date.getDate() + days);

    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

const EVENT_TYPE_ID = "11111111-1111-4111-8111-111111111111";
const EVENT_TYPE_ID_2 = "22222222-2222-4222-8222-222222222222";
const EVENT_TYPE_ID_CAP = "33333333-3333-4333-8333-333333333333";
const EMP_ID_1 = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

const mockEventTypes = [
    { eventTypeId: EVENT_TYPE_ID, name: "Cita médica" },
    { eventTypeId: EVENT_TYPE_ID_2, name: "Permiso personal" },
    { eventTypeId: EVENT_TYPE_ID_CAP, name: "Capacitaciones" },
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

const renderModal = (props = {}) => {
    const onClose = vi.fn();
    const onSuccess = vi.fn();

    render(
        <RegisterEventModal
            isOpen
            onClose={onClose}
            onSuccess={onSuccess}
            initialStartDate={TODAY}
            initialEndDate={TODAY}
            calendarTimeZoneMode="local"
            canSwitchCalendarTimeZone
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
            date: TODAY,
            allDay: false,
            start: zonedDateTimeToIso(
                TODAY,
                "09:00",
                getBrowserTimeZone(),
            ),
            end: zonedDateTimeToIso(TODAY, "10:00", getBrowserTimeZone()),
            timeZone: getBrowserTimeZone(),
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

    it("muestra la leyenda de horario local en modo local", async () => {
        renderModal();

        await waitFor(() => {
            expect(getEventTypes).toHaveBeenCalledTimes(1);
        });

        expect(
            screen.getByText(/este evento se guardará con base en tu horario local/i),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/no puede abarcar más de 1 día en horario central de méxico/i),
        ).toBeInTheDocument();
    });

    it("muestra la leyenda de horario central de México en modo México", async () => {
        renderModal({ calendarTimeZoneMode: "mexico" });

        await waitFor(() => {
            expect(getEventTypes).toHaveBeenCalledTimes(1);
        });

        expect(
            screen.getByText(/este evento se guardará con base en horario central de méxico/i),
        ).toBeInTheDocument();
    });

    it("bloquea un evento personal creado desde drag si abarca dos días en México central", async () => {
        renderModal({
            initialStartDate: "2026-06-05",
            initialEndDate: "2026-06-06",
            initialStartTime: "23:30",
            initialEndTime: "00:30",
            calendarTimeZone: "America/Mexico_City",
            calendarTimeZoneMode: "mexico",
        });

        await waitFor(() => {
            expect(getEventTypes).toHaveBeenCalledTimes(1);
        });

        expect(
            screen.getByText(/no se puede crear un evento personal que abarque más de 1 día/i),
        ).toBeInTheDocument();

        fillBaseFields();
        await clickFormConfirm();

        expect(
            screen.getByText(/no se puede crear un evento personal que abarque más de 1 día/i),
        ).toBeInTheDocument();
        expect(createPersonalEvent).not.toHaveBeenCalled();
    });

    it("permite que un evento personal termine a las 00:00 como cierre del mismo día", async () => {
        const { onClose, onSuccess } = renderModal({
            initialStartDate: "2026-06-05",
            initialEndDate: "2026-06-06",
            initialStartTime: "23:30",
            initialEndTime: "00:00",
            calendarTimeZone: "America/Mexico_City",
            calendarTimeZoneMode: "mexico",
        });

        await waitFor(() => {
            expect(getEventTypes).toHaveBeenCalledTimes(1);
        });

        fillBaseFields();
        await clickFormConfirm();

        await waitFor(() => {
            expect(createPersonalEvent).toHaveBeenCalledTimes(1);
        });

        expect(createPersonalEvent).toHaveBeenCalledWith(
            expect.objectContaining({
                date: "2026-06-05",
                start: zonedDateTimeToIso(
                    "2026-06-05",
                    "23:30",
                    "America/Mexico_City",
                ),
                end: zonedDateTimeToIso(
                    "2026-06-06",
                    "00:00",
                    "America/Mexico_City",
                ),
                timeZone: "America/Mexico_City",
            }),
        );
        expect(onSuccess).toHaveBeenCalledWith({
            personalEventId: "evt-1",
            name: "Reunión de equipo",
        });
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("permite un drag en horario foráneo cuando equivale a un día completo en México central", async () => {
        renderModal({
            initialStartDate: "2026-06-05",
            initialEndDate: "2026-06-06",
            initialStartTime: "07:00",
            initialEndTime: "07:00",
            calendarTimeZone: "Europe/London",
            calendarTimeZoneMode: "local",
        });

        await waitFor(() => {
            expect(getEventTypes).toHaveBeenCalledTimes(1);
        });

        expect(screen.getByLabelText("Fecha final")).toHaveValue("2026-06-06");

        fillBaseFields();
        await clickFormConfirm();

        await waitFor(() => {
            expect(createPersonalEvent).toHaveBeenCalledTimes(1);
        });

        expect(createPersonalEvent).toHaveBeenCalledWith(
            expect.objectContaining({
                date: "2026-06-05",
                start: zonedDateTimeToIso(
                    "2026-06-05",
                    "07:00",
                    "Europe/London",
                ),
                end: zonedDateTimeToIso(
                    "2026-06-06",
                    "07:00",
                    "Europe/London",
                ),
                timeZone: "Europe/London",
            }),
        );
    });

    it("permite un evento personal manual con fecha final si equivale a un día de México central", async () => {
        renderModal({
            initialStartDate: undefined,
            initialEndDate: undefined,
            calendarTimeZone: "Europe/London",
            calendarTimeZoneMode: "local",
        });

        await waitFor(() => {
            expect(getEventTypes).toHaveBeenCalledTimes(1);
        });

        fireEvent.change(screen.getByLabelText("Fecha"), {
            target: { value: "2026-06-05" },
        });
        fireEvent.change(screen.getByLabelText("Fecha final"), {
            target: { value: "2026-06-06" },
        });
        fillBaseFields();
        await selectStartTime("7:00 AM");
        await selectEndTime("7:00 AM");

        await clickFormConfirm();

        await waitFor(() => {
            expect(createPersonalEvent).toHaveBeenCalledTimes(1);
        });

        expect(createPersonalEvent).toHaveBeenCalledWith(
            expect.objectContaining({
                date: "2026-06-05",
                start: zonedDateTimeToIso(
                    "2026-06-05",
                    "07:00",
                    "Europe/London",
                ),
                end: zonedDateTimeToIso(
                    "2026-06-06",
                    "07:00",
                    "Europe/London",
                ),
                timeZone: "Europe/London",
            }),
        );
    });

    it("bloquea un evento personal manual si sus horas cruzan de día en México central", async () => {
        renderModal({
            initialStartDate: undefined,
            initialEndDate: undefined,
            calendarTimeZone: "Europe/London",
            calendarTimeZoneMode: "local",
        });

        await waitFor(() => {
            expect(getEventTypes).toHaveBeenCalledTimes(1);
        });

        fireEvent.change(screen.getByLabelText("Fecha"), {
            target: { value: "2026-06-05" },
        });
        fillBaseFields();
        await selectStartTime("6:30 AM");
        await selectEndTime("8:00 AM");

        await clickFormConfirm();

        expect(
            screen.getByText(/no se puede crear un evento personal que abarque más de 1 día/i),
        ).toBeInTheDocument();
        expect(createPersonalEvent).not.toHaveBeenCalled();
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
        renderModal({
            calendarTimeZone: "Europe/London",
            calendarTimeZoneMode: "local",
        });

        await waitFor(() => {
            expect(getEventTypes).toHaveBeenCalledTimes(1);
        });

        fillBaseFields();

        await act(async () => {
            fireEvent.click(screen.getByRole("checkbox"));
        });

        expect(
            screen.getByText(/Este evento se guardará con base en tu horario local. Sin embargo, no puede abarcar más de 1 día en horario central de México./i),
        ).toBeInTheDocument();

        await clickFormConfirm();

        await waitFor(() => {
            expect(createPersonalEvent).toHaveBeenCalledTimes(1);
        });

        expect(createPersonalEvent).toHaveBeenCalledWith(
            expect.objectContaining({
                allDay: true,
                date: TODAY,
                start: zonedDateTimeToIso(TODAY, "00:00", MEXICO_TIME_ZONE),
                end: zonedDateTimeToIso(
                    addDaysToLocalDateOnly(TODAY, 1),
                    "00:00",
                    MEXICO_TIME_ZONE,
                ),
                timeZone: MEXICO_TIME_ZONE,
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

    it("muestra error de validación cuando se selecciona Capacitaciones sin instructor", async () => {
        renderModal();

        await waitFor(() => {
            expect(getEventTypes).toHaveBeenCalledTimes(1);
        });

        fireEvent.change(screen.getByPlaceholderText("Agregar título"), {
            target: { value: "Capacitación React" },
        });

        fireEvent.change(screen.getByRole("combobox"), {
            target: { value: EVENT_TYPE_ID_CAP },
        });

        await selectStartTime("9:00 AM");
        await selectEndTime("10:00 AM");

        await clickFormConfirm();

        expect(
            screen.getByText("El instructor es obligatorio para eventos de capacitación."),
        ).toBeInTheDocument();
        expect(createPersonalEvent).not.toHaveBeenCalled();
    });

    it("crea un evento de Capacitaciones con el instructor incluido en el payload", async () => {
        const { onClose, onSuccess } = renderModal();

        await waitFor(() => {
            expect(getEventTypes).toHaveBeenCalledTimes(1);
        });

        fireEvent.change(screen.getByPlaceholderText("Agregar título"), {
            target: { value: "Capacitación React" },
        });

        fireEvent.change(screen.getByRole("combobox"), {
            target: { value: EVENT_TYPE_ID_CAP },
        });

        fireEvent.change(screen.getByPlaceholderText("Nombre del instructor"), {
            target: { value: "Ana García" },
        });

        await selectStartTime("9:00 AM");
        await selectEndTime("10:00 AM");

        await clickFormConfirm();

        await waitFor(() => {
            expect(createPersonalEvent).toHaveBeenCalledTimes(1);
        });

        expect(createPersonalEvent).toHaveBeenCalledWith(
            expect.objectContaining({
                eventTypeId: EVENT_TYPE_ID_CAP,
                trainer: "Ana García",
            }),
        );

        expect(onSuccess).toHaveBeenCalledTimes(1);
        expect(onClose).toHaveBeenCalledTimes(1);
    });
});
