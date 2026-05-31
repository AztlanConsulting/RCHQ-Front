import {
    act,
    fireEvent,
    render,
    screen,
    waitFor,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import UpdateHouseEventModal from "../../components/organism/evento/updateHouseEventModal";
import { updateHouseEvent } from "../../services/updateEventService";
import { getEventTypes } from "../../services/eventService";
import {
    getBrowserTimeZone,
    zonedDateTimeToIso,
} from "../../utils/timeZone";

vi.mock("../../services/updateEventService", () => ({
    updateHouseEvent: vi.fn(),
}));

vi.mock("../../services/eventService", () => ({
    getEventTypes: vi.fn(),
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

const mockEvent = {
    houseEventId: "evt-existing",
    title: "Limpieza inicial",
    eventTypeId: EVENT_TYPE_ID,
    description: "Descripción inicial.",
    allDay: false,
    isFreeDay: false,
    start: "2026-05-05T09:00:00.000Z",
    end: "2026-05-05T10:00:00.000Z",
};

const renderModal = async (props = {}) => {
    const onClose = vi.fn();
    const onSuccess = vi.fn();

    await act(async () => {
        render(
            <UpdateHouseEventModal
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
    await screen.findByRole("option", { name: /limpieza/i });
};

const clickSubmit = async () => {
    await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /^Editar$/i }));
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

describe("Integración: editar evento de casa", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();

        getEventTypes.mockResolvedValue(mockEventTypes);

        updateHouseEvent.mockResolvedValue({
            success: true,
            data: {
                houseEventId: "evt-existing",
                name: "Limpieza inicial",
            },
        });
    });

    it("obtiene y muestra los tipos de evento al abrir el modal", async () => {
        await renderModal();

        expect(getEventTypes).toHaveBeenCalled();

        expect(
            await screen.findByRole("option", { name: /limpieza/i }),
        ).toBeInTheDocument();

        expect(
            screen.getByRole("option", { name: /mantenimiento/i }),
        ).toBeInTheDocument();
    });

    it("pre-popula el formulario con los datos del evento", async () => {
        await renderModal();
        await waitForForm();

        expect(screen.getByPlaceholderText("Evento de casa")).toHaveValue(
            "Limpieza inicial",
        );
        expect(screen.getByLabelText("Fecha de inicio")).toHaveValue(
            "2026-05-05",
        );
        expect(screen.getByLabelText("Fecha de fin")).toHaveValue("2026-05-05");
    });

    it("muestra placeholders de fecha cuando el evento no tiene fechas", async () => {
        await renderModal({
            event: { ...mockEvent, start: undefined, end: undefined },
        });

        expect(screen.getByLabelText("Fecha de inicio")).toHaveValue("");
        expect(screen.getByLabelText("Fecha de inicio")).toHaveAttribute(
            "placeholder",
            "dd / mm / yyyy",
        );
        expect(screen.getByLabelText("Fecha de fin")).toHaveValue("");
        expect(screen.getByLabelText("Fecha de fin")).toHaveAttribute(
            "placeholder",
            "dd / mm / yyyy",
        );
    });

    it("modifica un evento de casa con los datos del formulario", async () => {
        const { onClose, onSuccess } = await renderModal();
        await waitForForm();

        await clickSubmit();

        await waitFor(() => {
            expect(updateHouseEvent).toHaveBeenCalledTimes(1);
        });

        expect(updateHouseEvent).toHaveBeenCalledWith("evt-existing", {
            eventTypeId: EVENT_TYPE_ID,
            name: "Limpieza inicial",
            start: mockEvent.start,
            end: mockEvent.end,
            allDay: false,
            isFreeDay: false,
            timeZone: getBrowserTimeZone(),
            description: "Descripción inicial.",
            forceOverlap: false,
        });

        expect(onSuccess).toHaveBeenCalledWith({
            houseEventId: "evt-existing",
            name: "Limpieza inicial",
        });

        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("muestra error si se intenta editar sin nombre", async () => {
        await renderModal();
        await waitForForm();

        fireEvent.change(screen.getByPlaceholderText("Evento de casa"), {
            target: { value: "" },
        });

        await clickSubmit();

        expect(
            screen.getByText("El titulo es obligatorio"),
        ).toBeInTheDocument();
        expect(updateHouseEvent).not.toHaveBeenCalled();
    });

    it("modifica un evento de todo el día", async () => {
        await renderModal();
        await waitForForm();

        fireEvent.click(screen.getByLabelText(/todo el día/i));

        await clickSubmit();

        await waitFor(() => {
            expect(updateHouseEvent).toHaveBeenCalledTimes(1);
        });

        expect(updateHouseEvent).toHaveBeenCalledWith(
            "evt-existing",
            expect.objectContaining({
                allDay: true,
                start: zonedDateTimeToIso(
                    "2026-05-05",
                    "00:00",
                    getBrowserTimeZone(),
                ),
                end: zonedDateTimeToIso(
                    "2026-05-06",
                    "00:00",
                    getBrowserTimeZone(),
                ),
                timeZone: getBrowserTimeZone(),
            }),
        );
    });

    it("muestra el modal de empalme cuando el backend regresa colisiones", async () => {
        updateHouseEvent.mockResolvedValueOnce({
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

        await renderModal();
        await waitForForm();

        await clickSubmit();

        expect(
            await screen.findByText(/se empalma con “Evento existente”/i),
        ).toBeInTheDocument();

        expect(screen.getByText("Evento existente")).toBeInTheDocument();
    });

    it("permite forzar la modificación cuando hay empalme", async () => {
        updateHouseEvent
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
                    houseEventId: "evt-existing",
                    name: "Limpieza inicial",
                },
            });

        const { onClose, onSuccess } = await renderModal();
        await waitForForm();

        await clickSubmit();

        await screen.findByText(/se empalma con “Evento existente”/i);

        await clickLastConfirm();

        await waitFor(() => {
            expect(updateHouseEvent).toHaveBeenCalledTimes(2);
        });

        expect(updateHouseEvent).toHaveBeenLastCalledWith(
            "evt-existing",
            expect.objectContaining({
                forceOverlap: true,
            }),
        );

        expect(onSuccess).toHaveBeenCalledWith({
            houseEventId: "evt-existing",
            name: "Limpieza inicial",
        });

        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("muestra error del servidor si falla updateHouseEvent", async () => {
        updateHouseEvent.mockRejectedValueOnce(
            new Error("Error al editar evento"),
        );

        await renderModal();
        await waitForForm();

        await clickSubmit();

        await waitFor(() => {
            expect(updateHouseEvent).toHaveBeenCalledTimes(1);
        });

        expect(
            await screen.findByText("Error al editar evento"),
        ).toBeInTheDocument();
    });
});
