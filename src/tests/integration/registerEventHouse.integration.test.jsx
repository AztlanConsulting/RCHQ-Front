import {
    act,
    fireEvent,
    render,
    screen,
    waitFor,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import RegisterEventModal from "../../components/organism/evento/registerEventModal";
import { createHouseEvent, getEventTypes } from "../../services/eventService";

vi.mock("../../services/eventService", () => ({
    createHouseEvent: vi.fn(),
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

vi.mock("/absence-black.svg", () => ({ default: "absence-black.svg" }));
vi.mock("/global-black.svg", () => ({ default: "global-black.svg" }));
vi.mock("/house-black.svg", () => ({ default: "house-black.svg" }));
vi.mock("/personal-black.svg", () => ({ default: "personal-black.svg" }));
vi.mock("/vacation-black.svg", () => ({ default: "vacation-black.svg" }));
vi.mock("/time.svg", () => ({ default: "time.svg" }));
vi.mock("/chevron-down.svg", () => ({ default: "chevron-down.svg" }));
vi.mock("/search.svg", () => ({ default: "search.svg" }));
vi.mock("/close.svg", () => ({ default: "close.svg" }));

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

const renderModal = async (props = {}) => {
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
    await act(async () => {
        fireEvent.click(screen.getByRole("radio", { name: "Casa" }));
    });

    return { onClose, onSuccess };
};
const waitForHouseForm = async () => {
    await screen.findByRole("option", { name: /limpieza/i });
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
    fireEvent.click(screen.getAllByRole("button", { name: buttonName })[0]);

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
        localStorage.clear();
        localStorage.setItem("user", JSON.stringify({ role: "Coordinador" }));

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
        await renderModal();

        expect(getEventTypes).toHaveBeenCalled();

        expect(
            await screen.findByRole("option", { name: /limpieza/i }),
        ).toBeInTheDocument();

        expect(
            screen.getByRole("option", { name: /mantenimiento/i }),
        ).toBeInTheDocument();
    });

    it("muestra placeholders de fecha cuando abre sin fechas iniciales", async () => {
        await renderModal({
            initialStartDate: undefined,
            initialEndDate: undefined,
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

    it("crea un evento de casa con los datos del formulario", async () => {
        const { onClose, onSuccess } = await renderModal();
        await waitForHouseForm();

        await fillRequiredFields();

        await selectTime(/-- : --/i, "9:00 AM");
        await selectTime(/-- : --/i, "10:00 AM");

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
        await renderModal();
        await waitForHouseForm();

        fireEvent.change(screen.getByRole("combobox"), {
            target: { value: EVENT_TYPE_ID },
        });

        await clickFormConfirm();

        expect(
            screen.getByText("El titulo es obligatorio"),
        ).toBeInTheDocument();
        expect(createHouseEvent).not.toHaveBeenCalled();
    });

    it("crea un evento de todo el día", async () => {
        await renderModal();
        await waitForHouseForm();

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

        await renderModal();

        await waitForHouseForm();

        await fillRequiredFields();
        await selectTime(/-- : --/i, "9:00 AM");
        await selectTime(/-- : --/i, "10:00 AM");

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

        const { onClose, onSuccess } = await renderModal();
        await waitForHouseForm();

        await fillRequiredFields();
        await selectTime(/-- : --/i, "9:00 AM");
        await selectTime(/-- : --/i, "10:00 AM");

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

        await renderModal();
        await waitForHouseForm();

        await fillRequiredFields();
        await selectTime(/-- : --/i, "9:00 AM");
        await selectTime(/-- : --/i, "10:00 AM");

        await clickFormConfirm();

        expect(await screen.findByRole("alert")).toHaveTextContent(
            "Error al registrar evento",
        );
    });
});
