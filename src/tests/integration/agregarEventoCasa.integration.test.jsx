import {
    act,
    fireEvent,
    render,
    screen,
    waitFor,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import RegisterEventModal from "../../pages/evento/agregarEvento";
import { createHouseEvent, getEventTypes } from "../../services/eventService";

vi.mock("../../services/eventService", () => ({
    createHouseEvent: vi.fn(),
    getEventTypes: vi.fn(),
}));

vi.mock("../../components/atoms/alerts", () => ({
    default: ({ message }) => <div role="alert">{message}</div>,
}));

vi.mock("../../components/atoms/dateField", () => ({
    default: ({ label, value, onChange }) => (
        <label>
            {label}
            <input
                aria-label={label}
                type="date"
                value={value ?? ""}
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

const EVENT_TYPE_ID = "11111111-1111-4111-8111-111111111111";
const EVENT_TYPE_ID_2 = "22222222-2222-4222-8222-222222222222";

const mockEventTypes = [
    {
        eventTypeId: EVENT_TYPE_ID,
        name: "Limpieza",
    },
    {
        eventTypeId: EVENT_TYPE_ID_2,
        name: "Mantenimiento",
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
            initialStartDate="2026-05-05"
            initialEndDate="2026-05-05"
            {...props}
        />,
    );

    return { onClose, onSuccess };
};

const fillRequiredFields = async () => {
    fireEvent.change(screen.getByPlaceholderText("Agregar título"), {
        target: { value: "Limpieza profunda" },
    });

    fireEvent.change(screen.getByRole("combobox"), {
        target: { value: EVENT_TYPE_ID },
    });

    fireEvent.change(screen.getByPlaceholderText("Agregar descripción ..."), {
        target: { value: "Preparar la casa para visita." },
    });
};

const selectTime = async (buttonName, optionName) => {
    fireEvent.click(screen.getByRole("button", { name: buttonName }));

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

describe("Integración: agregar evento de casa", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        getEventTypes.mockResolvedValue(mockEventTypes);

        createHouseEvent.mockResolvedValue({
            success: true,
            data: {
                houseEventId: "evt-1",
                name: "Limpieza profunda",
            },
        });
    });

    it("obtiene y muestra los tipos de evento al abrir el modal", async () => {
        renderModal();

        await waitFor(() => {
            expect(getEventTypes).toHaveBeenCalledTimes(1);
        });

        expect(
            screen.getByRole("option", { name: /limpieza/i }),
        ).toBeInTheDocument();

        expect(
            screen.getByRole("option", { name: /mantenimiento/i }),
        ).toBeInTheDocument();
    });

    it("crea un evento de casa con los datos del formulario", async () => {
        const { onClose, onSuccess } = renderModal();

        await waitFor(() => {
            expect(getEventTypes).toHaveBeenCalledTimes(1);
        });

        await fillRequiredFields();

        await selectTime(/hora inicio/i, "9:00 AM");
        await selectTime(/hora fin/i, "10:00 AM");

        await clickFormConfirm();

        await waitFor(() => {
            expect(createHouseEvent).toHaveBeenCalledTimes(1);
        });

        expect(createHouseEvent).toHaveBeenCalledWith({
            eventTypeId: EVENT_TYPE_ID,
            name: "Limpieza profunda",
            start: "2026-05-05T09:00:00.000-06:00",
            end: "2026-05-05T10:00:00.000-06:00",
            allDay: false,
            isFreeDay: false,
            description: "Preparar la casa para visita.",
            forceOverlap: false,
        });

        expect(onSuccess).toHaveBeenCalledWith({
            houseEventId: "evt-1",
            name: "Limpieza profunda",
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
            screen.getByText("El nombre es obligatorio"),
        ).toBeInTheDocument();
        expect(createHouseEvent).not.toHaveBeenCalled();
    });

    it("crea un evento de todo el día", async () => {
        renderModal();

        await waitFor(() => {
            expect(getEventTypes).toHaveBeenCalledTimes(1);
        });

        await fillRequiredFields();

        fireEvent.click(screen.getByLabelText(/todo el día/i));

        await clickFormConfirm();

        await waitFor(() => {
            expect(createHouseEvent).toHaveBeenCalledTimes(1);
        });

        expect(createHouseEvent).toHaveBeenCalledWith(
            expect.objectContaining({
                allDay: true,
                start: "2026-05-05",
                end: "2026-05-05",
            }),
        );
    });

    it("muestra el modal de empalme cuando el backend regresa colisiones", async () => {
        createHouseEvent.mockResolvedValueOnce({
            success: false,
            data: {
                collisions: [
                    {
                        houseEventId: "collision-1",
                        name: "Evento existente",
                        start: "2026-05-05T09:30:00.000Z",
                        end: "2026-05-05T10:30:00.000Z",
                    },
                ],
            },
        });

        renderModal();

        await waitFor(() => {
            expect(getEventTypes).toHaveBeenCalledTimes(1);
        });

        await fillRequiredFields();
        await selectTime(/hora inicio/i, "9:00 AM");
        await selectTime(/hora fin/i, "10:00 AM");

        await clickFormConfirm();

        expect(
            await screen.findByText(/se empalma con “Evento existente”/i),
        ).toBeInTheDocument();

        expect(screen.getByText("Evento existente")).toBeInTheDocument();
    });

    it("permite forzar el registro cuando hay empalme", async () => {
        createHouseEvent
            .mockResolvedValueOnce({
                success: false,
                data: {
                    collisions: [
                        {
                            houseEventId: "collision-1",
                            name: "Evento existente",
                            start: "2026-05-05T09:30:00.000Z",
                            end: "2026-05-05T10:30:00.000Z",
                        },
                    ],
                },
            })
            .mockResolvedValueOnce({
                success: true,
                data: {
                    houseEventId: "evt-forced",
                    name: "Limpieza profunda",
                },
            });

        const { onClose, onSuccess } = renderModal();

        await waitFor(() => {
            expect(getEventTypes).toHaveBeenCalledTimes(1);
        });

        await fillRequiredFields();
        await selectTime(/hora inicio/i, "9:00 AM");
        await selectTime(/hora fin/i, "10:00 AM");

        await clickFormConfirm();

        await screen.findByText(/se empalma con “Evento existente”/i);

        await clickLastConfirm();

        await waitFor(() => {
            expect(createHouseEvent).toHaveBeenCalledTimes(2);
        });

        expect(createHouseEvent).toHaveBeenLastCalledWith(
            expect.objectContaining({
                forceOverlap: true,
            }),
        );

        expect(onSuccess).toHaveBeenCalledWith({
            houseEventId: "evt-forced",
            name: "Limpieza profunda",
        });

        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("muestra error del servidor si falla createHouseEvent", async () => {
        createHouseEvent.mockRejectedValueOnce(
            new Error("Error al registrar evento"),
        );

        renderModal();

        await waitFor(() => {
            expect(getEventTypes).toHaveBeenCalledTimes(1);
        });

        await fillRequiredFields();
        await selectTime(/hora inicio/i, "9:00 AM");
        await selectTime(/hora fin/i, "10:00 AM");

        await clickFormConfirm();

        expect(await screen.findByRole("alert")).toHaveTextContent(
            "Error al registrar evento",
        );
    });
});
