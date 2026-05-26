import {
    act,
    fireEvent,
    render,
    screen,
    waitFor,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import UpdatePersonalEventModal from "../../components/organism/evento/updatePersonalEventModal";
import { updatePersonalEvent } from "../../services/updateEventService";
import {
    getEventTypes,
    getEmployeesForSelector,
} from "../../services/eventService";
import { getCalendarViewerRole } from "../../services/calendarService";

vi.mock("../../services/updateEventService", () => ({
    updatePersonalEvent: vi.fn(),
}));

vi.mock("../../services/eventService", () => ({
    getEventTypes: vi.fn(),
    getEmployeesForSelector: vi.fn(),
}));

vi.mock("../../services/calendarService", () => ({
    getCalendarViewerRole: vi.fn(),
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
    default: ({ label, selected = [], onSelect, onRemove }) => (
        <div>
            <span>{label}</span>
            <button
                type="button"
                onClick={() =>
                    onSelect({
                        employeeId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
                        fullName: "María López",
                    })
                }
            >
                Seleccionar María López
            </button>
            {selected.map((emp) => (
                <div key={emp.employeeId}>
                    <span>{emp.fullName}</span>
                    <button
                        type="button"
                        onClick={() => onRemove(emp.employeeId)}
                        aria-label={`Remover a ${emp.fullName}`}
                    >
                        Remover
                    </button>
                </div>
            ))}
        </div>
    ),
}));

vi.mock("/time.svg", () => ({ default: "time.svg" }));
vi.mock("/chevron-down.svg", () => ({ default: "chevron-down.svg" }));

const _d = new Date();
const TODAY = `${_d.getFullYear()}-${String(_d.getMonth() + 1).padStart(2, "0")}-${String(_d.getDate()).padStart(2, "0")}`;

const EVENT_TYPE_ID = "11111111-1111-4111-8111-111111111111";
const EVENT_TYPE_ID_2 = "22222222-2222-4222-8222-222222222222";
const PERSONAL_EVENT_ID = "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee";
const EMP_ID_1 = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const EMP_ID_2 = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";

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

const mockEvent = {
    eventId: PERSONAL_EVENT_ID,
    title: "Cita médica",
    eventTypeId: EVENT_TYPE_ID,
    eventType: "Cita médica",
    description: "Revisión anual.",
    allDay: false,
    start: new Date(`${TODAY}T09:00:00.000Z`),
    end: new Date(`${TODAY}T10:00:00.000Z`),
    date: TODAY,
    peopleInsideEvent: [{ name: "Juan Pérez", id: EMP_ID_1 }],
};

const renderModal = async (props = {}) => {
    const onClose = vi.fn();
    const onSuccess = vi.fn();

    await act(async () => {
        render(
            <UpdatePersonalEventModal
                isOpen
                onClose={onClose}
                onSuccess={onSuccess}
                event={mockEvent}
                {...props}
            />,
        );
    });

    return { onClose, onSuccess };
};

const waitForForm = async () => {
    await screen.findByRole("option", { name: /cita médica/i });
};

const clickSubmit = async () => {
    await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /^modificar$/i }));
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

describe("Integración: modificar evento personal", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        getCalendarViewerRole.mockReturnValue("Empleado");
        getEventTypes.mockResolvedValue(mockEventTypes);
        getEmployeesForSelector.mockResolvedValue([]);
        updatePersonalEvent.mockResolvedValue({
            success: true,
            data: {
                personalEventId: PERSONAL_EVENT_ID,
                name: "Cita médica",
            },
        });
    });

    it("obtiene y muestra los tipos de evento al abrir el modal", async () => {
        await renderModal();

        expect(getEventTypes).toHaveBeenCalled();

        expect(
            await screen.findByRole("option", { name: /cita médica/i }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("option", { name: /permiso personal/i }),
        ).toBeInTheDocument();
    });

    it("pre-popula el formulario con los datos del evento", async () => {
        await renderModal();
        await waitForForm();

        expect(screen.getByPlaceholderText("Evento personal")).toHaveValue(
            "Cita médica",
        );
        expect(screen.getByLabelText("Fecha")).toHaveValue(TODAY);
    });

    it("muestra placeholder de fecha cuando el evento no tiene fecha", async () => {
        await renderModal({
            event: {
                ...mockEvent,
                date: undefined,
                start: undefined,
                end: undefined,
            },
        });

        expect(screen.getByLabelText("Fecha")).toHaveValue("");
        expect(screen.getByLabelText("Fecha")).toHaveAttribute(
            "placeholder",
            "dd / mm / yyyy",
        );
    });

    it("modifica un evento personal con los datos del formulario", async () => {
        const { onClose, onSuccess } = await renderModal();
        await waitForForm();

        await clickSubmit();

        await waitFor(() => {
            expect(updatePersonalEvent).toHaveBeenCalledTimes(1);
        });

        expect(updatePersonalEvent).toHaveBeenCalledWith(PERSONAL_EVENT_ID, {
            name: "Cita médica",
            eventTypeId: EVENT_TYPE_ID,
            date: TODAY,
            allDay: false,
            start: "09:00:00",
            end: "10:00:00",
            description: "Revisión anual.",
            employeeIds: [EMP_ID_1],
            forceOverlap: false,
        });

        expect(onSuccess).toHaveBeenCalledWith({
            personalEventId: PERSONAL_EVENT_ID,
            name: "Cita médica",
        });
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("muestra error si se intenta modificar sin nombre", async () => {
        await renderModal();
        await waitForForm();

        fireEvent.change(screen.getByPlaceholderText("Evento personal"), {
            target: { value: "" },
        });

        await clickSubmit();

        expect(
            screen.getByText("El titulo es obligatorio"),
        ).toBeInTheDocument();
        expect(updatePersonalEvent).not.toHaveBeenCalled();
    });

    it("modifica un evento de todo el día", async () => {
        await renderModal();
        await waitForForm();

        fireEvent.click(screen.getByLabelText(/todo el día/i));

        await clickSubmit();

        await waitFor(() => {
            expect(updatePersonalEvent).toHaveBeenCalledTimes(1);
        });

        expect(updatePersonalEvent).toHaveBeenCalledWith(
            PERSONAL_EVENT_ID,
            expect.objectContaining({
                allDay: true,
                date: TODAY,
            }),
        );
    });

    it("muestra el modal de empalme cuando el backend regresa empleados con colisiones", async () => {
        updatePersonalEvent.mockResolvedValueOnce({
            success: false,
            data: { overlappedEmployees: mockOverlappedEmployees },
        });

        await renderModal();
        await waitForForm();

        await clickSubmit();

        await waitFor(() => {
            expect(updatePersonalEvent).toHaveBeenCalledTimes(1);
        });

        expect(
            await screen.findByText(
                'El empleado "Juan Pérez" tiene empalme en ese horario',
            ),
        ).toBeInTheDocument();

        expect(screen.getByText("Juan Pérez")).toBeInTheDocument();
        expect(
            screen.getAllByText("Cita médica").length,
        ).toBeGreaterThanOrEqual(1);
    });

    it("muestra error del servidor si falla updatePersonalEvent", async () => {
        updatePersonalEvent.mockRejectedValueOnce(
            new Error("Error inesperado al modificar el evento"),
        );

        await renderModal();
        await waitForForm();

        await clickSubmit();

        await waitFor(() => {
            expect(updatePersonalEvent).toHaveBeenCalledTimes(1);
        });

        expect(await screen.findByRole("alert")).toHaveTextContent(
            "Error inesperado al modificar el evento",
        );
    });

    describe("modo coordinador", () => {
        beforeEach(() => {
            getCalendarViewerRole.mockReturnValue("Coordinador");
        });

        it("muestra los empleados pre-seleccionados del evento al abrir", async () => {
            await renderModal();
            await waitForForm();

            expect(
                screen.getByText("Agregar empleados"),
            ).toBeInTheDocument();
            expect(screen.getByText("Juan Pérez")).toBeInTheDocument();
        });

        it("modifica el evento incluyendo los empleados pre-seleccionados", async () => {
            const { onClose, onSuccess } = await renderModal();
            await waitForForm();

            await clickSubmit();

            await waitFor(() => {
                expect(updatePersonalEvent).toHaveBeenCalledTimes(1);
            });

            expect(updatePersonalEvent).toHaveBeenCalledWith(
                PERSONAL_EVENT_ID,
                expect.objectContaining({ employeeIds: [EMP_ID_1] }),
            );

            expect(onSuccess).toHaveBeenCalled();
            expect(onClose).toHaveBeenCalledTimes(1);
        });

        it("permite agregar un nuevo empleado e incluirlo en el payload", async () => {
            await renderModal();
            await waitForForm();

            fireEvent.click(
                screen.getByRole("button", {
                    name: "Seleccionar María López",
                }),
            );

            await clickSubmit();

            await waitFor(() => {
                expect(updatePersonalEvent).toHaveBeenCalledTimes(1);
            });

            expect(updatePersonalEvent).toHaveBeenCalledWith(
                PERSONAL_EVENT_ID,
                expect.objectContaining({
                    employeeIds: expect.arrayContaining([EMP_ID_1, EMP_ID_2]),
                }),
            );
        });

        it("muestra error si se intenta modificar sin empleados seleccionados", async () => {
            await renderModal({
                event: { ...mockEvent, peopleInsideEvent: [] },
            });
            await waitForForm();

            await clickSubmit();

            expect(
                screen.getByText("Debes seleccionar al menos un empleado."),
            ).toBeInTheDocument();
            expect(updatePersonalEvent).not.toHaveBeenCalled();
        });

        it("permite forzar la modificación cuando hay empalme", async () => {
            updatePersonalEvent
                .mockResolvedValueOnce({
                    success: false,
                    data: { overlappedEmployees: mockOverlappedEmployees },
                })
                .mockResolvedValueOnce({
                    success: true,
                    data: {
                        personalEventId: PERSONAL_EVENT_ID,
                        name: "Cita médica",
                    },
                });

            const { onClose, onSuccess } = await renderModal();
            await waitForForm();

            await clickSubmit();

            await screen.findByText(
                'El empleado "Juan Pérez" tiene empalme en ese horario',
            );

            await clickLastConfirm();

            await waitFor(() => {
                expect(updatePersonalEvent).toHaveBeenCalledTimes(2);
            });

            expect(updatePersonalEvent).toHaveBeenLastCalledWith(
                PERSONAL_EVENT_ID,
                expect.objectContaining({ forceOverlap: true }),
            );

            expect(onSuccess).toHaveBeenCalled();
            expect(onClose).toHaveBeenCalledTimes(1);
        });
    });
});
