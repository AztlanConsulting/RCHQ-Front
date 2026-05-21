import React, { useState } from "react";
import {
    act,
    fireEvent,
    render,
    screen,
    waitFor,
    within,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import EventDetail from "../../components/molecules/calendarCards/eventDetail";
import { deleteHouseEvent } from "../../services/deleteEventService";

vi.mock("../../services/deleteEventService", () => ({
    deleteHouseEvent: vi.fn(),
}));

// ─── Datos de prueba ────────────────────────────────────────────────────────

const HOUSE_EVENT = {
    houseEventId: "house-evt-001",
    title: "Limpieza semanal",
    scope: "house",
    scopeLabel: "Casa",
    focus: "eventos",
    focusLabel: "Eventos",
    eventType: "Limpieza",
    allDay: true,
    start: "2026-05-10",
    end: "2026-05-10",
    description: "Limpieza general de la casa.",
    borderColor: "#1F3664",
    backgroundColor: "#1F3664",
};

const PERSONAL_EVENT = {
    ...HOUSE_EVENT,
    houseEventId: "personal-evt-001",
    title: "Reunión de equipo",
    scope: "personal",
    scopeLabel: "Personal",
};

const GLOBAL_EVENT = {
    ...HOUSE_EVENT,
    houseEventId: undefined,
    eventId: "global-evt-001",
    title: "Evento corporativo",
    scope: "global",
    scopeLabel: "Global",
};

// ─── Wrapper con estado (replica la lógica de useCalendarPage) ───────────────

const EventDetailWithDelete = ({ event, viewerRole, onSuccess = vi.fn() }) => {
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState("");

    const handleConfirmDelete = async () => {
        const id = event?.houseEventId ?? event?.eventId;
        if (!id) return;

        setIsDeleting(true);
        setDeleteError("");

        try {
            await deleteHouseEvent(id);
            setIsDeleteOpen(false);
            onSuccess();
        } catch (err) {
            setDeleteError(err?.message ?? "Error al eliminar el evento");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <EventDetail
            event={event}
            viewerRole={viewerRole}
            onEdit={vi.fn()}
            onDelete={() => setIsDeleteOpen(true)}
            isDeleteOpen={isDeleteOpen}
            onCancelDelete={() => {
                setIsDeleteOpen(false);
                setDeleteError("");
            }}
            onConfirmDelete={handleConfirmDelete}
            isDeleting={isDeleting}
            deleteError={deleteError}
        />
    );
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const renderDetail = async (
    event = HOUSE_EVENT,
    viewerRole = "Coordinador",
    onSuccess = vi.fn(),
) => {
    await act(async () => {
        render(
            <EventDetailWithDelete
                event={event}
                viewerRole={viewerRole}
                onSuccess={onSuccess}
            />,
        );
    });
    return { onSuccess };
};

// Abre el modal de confirmación haciendo clic en el botón Eliminar del detalle.
// Cuando la confirmación no está abierta solo hay un botón "Eliminar".
const clickEliminar = async () => {
    await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /^eliminar$/i }));
    });
};

// Confirma la eliminación haciendo clic en el botón Eliminar dentro del modal
// de confirmación. Cuando el modal está abierto hay dos botones "Eliminar" en
// el DOM; el último corresponde al de confirmación.
const clickConfirmEliminar = async () => {
    const buttons = screen.getAllByRole("button", { name: /^eliminar$/i });
    await act(async () => {
        fireEvent.click(buttons[buttons.length - 1]);
    });
};

const clickCancelar = async () => {
    await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /^cancelar$/i }));
    });
};

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("Integración: eliminar evento de casa", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();

        deleteHouseEvent.mockResolvedValue({ success: true });
    });

    // ── Visibilidad de botones por rol ────────────────────────────────────────

    describe("visibilidad de botones según rol", () => {
        it("muestra Eliminar y Editar al Coordinador en evento de casa", async () => {
            await renderDetail(HOUSE_EVENT, "Coordinador");

            expect(
                screen.getByRole("button", { name: /^eliminar$/i }),
            ).toBeInTheDocument();
            expect(
                screen.getByRole("button", { name: /^editar$/i }),
            ).toBeInTheDocument();
        });

        it("muestra Eliminar y Editar al Coordinador en evento personal", async () => {
            await renderDetail(PERSONAL_EVENT, "Coordinador");

            expect(
                screen.getByRole("button", { name: /^eliminar$/i }),
            ).toBeInTheDocument();
            expect(
                screen.getByRole("button", { name: /^editar$/i }),
            ).toBeInTheDocument();
        });

        it("oculta Eliminar y Editar a roles sin permiso en evento de casa", async () => {
            await renderDetail(HOUSE_EVENT, "Empleado");

            expect(
                screen.queryByRole("button", { name: /^eliminar$/i }),
            ).not.toBeInTheDocument();
            expect(
                screen.queryByRole("button", { name: /^editar$/i }),
            ).not.toBeInTheDocument();
        });

        it("muestra Eliminar y Editar al Administrador en evento global", async () => {
            await renderDetail(GLOBAL_EVENT, "Administrador");

            expect(
                screen.getByRole("button", { name: /^eliminar$/i }),
            ).toBeInTheDocument();
            expect(
                screen.getByRole("button", { name: /^editar$/i }),
            ).toBeInTheDocument();
        });

        it("oculta Eliminar y Editar al Coordinador en evento global", async () => {
            await renderDetail(GLOBAL_EVENT, "Coordinador");

            expect(
                screen.queryByRole("button", { name: /^eliminar$/i }),
            ).not.toBeInTheDocument();
            expect(
                screen.queryByRole("button", { name: /^editar$/i }),
            ).not.toBeInTheDocument();
        });

        it("oculta Eliminar y Editar al Administrador en evento de casa", async () => {
            await renderDetail(HOUSE_EVENT, "Administrador");

            expect(
                screen.queryByRole("button", { name: /^eliminar$/i }),
            ).not.toBeInTheDocument();
            expect(
                screen.queryByRole("button", { name: /^editar$/i }),
            ).not.toBeInTheDocument();
        });
    });

    // ── Flujo de confirmación ─────────────────────────────────────────────────

    describe("flujo de confirmación de eliminación", () => {
        it("muestra el modal de confirmación con el nombre del evento al hacer clic en Eliminar", async () => {
            await renderDetail(HOUSE_EVENT, "Coordinador");

            await clickEliminar();

            const dialog = screen.getByRole("dialog");
            expect(within(dialog).getByText(/eliminar evento/i)).toBeInTheDocument();
            expect(within(dialog).getByText(/Limpieza semanal/)).toBeInTheDocument();
        });

        it("cierra el modal de confirmación al hacer clic en Cancelar", async () => {
            await renderDetail(HOUSE_EVENT, "Coordinador");

            await clickEliminar();
            expect(screen.getByText(/eliminar evento/i)).toBeInTheDocument();

            await clickCancelar();

            expect(
                screen.queryByText(/eliminar evento/i),
            ).not.toBeInTheDocument();
        });

        it("no llama al servicio si se cancela la confirmación", async () => {
            await renderDetail(HOUSE_EVENT, "Coordinador");

            await clickEliminar();
            await clickCancelar();

            expect(deleteHouseEvent).not.toHaveBeenCalled();
        });
    });

    // ── Llamada al servicio ───────────────────────────────────────────────────

    describe("llamada al servicio deleteHouseEvent", () => {
        it("llama a deleteHouseEvent con el ID correcto al confirmar", async () => {
            await renderDetail(HOUSE_EVENT, "Coordinador");

            await clickEliminar();
            await clickConfirmEliminar();

            await waitFor(() => {
                expect(deleteHouseEvent).toHaveBeenCalledTimes(1);
            });

            expect(deleteHouseEvent).toHaveBeenCalledWith("house-evt-001");
        });

        it("usa eventId cuando el evento no tiene houseEventId", async () => {
            await renderDetail(GLOBAL_EVENT, "Administrador");

            await clickEliminar();
            await clickConfirmEliminar();

            await waitFor(() => {
                expect(deleteHouseEvent).toHaveBeenCalledWith("global-evt-001");
            });
        });

        it("llama a onSuccess tras eliminar exitosamente", async () => {
            const onSuccess = vi.fn();
            await renderDetail(HOUSE_EVENT, "Coordinador", onSuccess);

            await clickEliminar();
            await clickConfirmEliminar();

            await waitFor(() => {
                expect(onSuccess).toHaveBeenCalledTimes(1);
            });
        });

        it("cierra la confirmación tras eliminar exitosamente", async () => {
            await renderDetail(HOUSE_EVENT, "Coordinador");

            await clickEliminar();
            await clickConfirmEliminar();

            await waitFor(() => {
                expect(deleteHouseEvent).toHaveBeenCalledTimes(1);
            });

            expect(
                screen.queryByText(/eliminar evento/i),
            ).not.toBeInTheDocument();
        });
    });

    // ── Manejo de errores ─────────────────────────────────────────────────────

    describe("manejo de errores", () => {
        it("muestra el mensaje de error si deleteHouseEvent falla", async () => {
            deleteHouseEvent.mockRejectedValueOnce(
                new Error("No se pudo eliminar el evento de casa"),
            );

            await renderDetail(HOUSE_EVENT, "Coordinador");

            await clickEliminar();
            await clickConfirmEliminar();

            expect(
                await screen.findByText("No se pudo eliminar el evento de casa"),
            ).toBeInTheDocument();
        });

        it("no llama a onSuccess si deleteHouseEvent falla", async () => {
            deleteHouseEvent.mockRejectedValueOnce(new Error("Error del servidor"));

            const onSuccess = vi.fn();
            await renderDetail(HOUSE_EVENT, "Coordinador", onSuccess);

            await clickEliminar();
            await clickConfirmEliminar();

            await waitFor(() => {
                expect(deleteHouseEvent).toHaveBeenCalledTimes(1);
            });

            expect(onSuccess).not.toHaveBeenCalled();
        });

        it("mantiene la confirmación abierta si el servicio falla", async () => {
            deleteHouseEvent.mockRejectedValueOnce(new Error("Error del servidor"));

            await renderDetail(HOUSE_EVENT, "Coordinador");

            await clickEliminar();
            await clickConfirmEliminar();

            expect(
                await screen.findByText(/eliminar evento/i),
            ).toBeInTheDocument();
        });

        it("limpia el error al cancelar después de un fallo", async () => {
            deleteHouseEvent.mockRejectedValueOnce(new Error("Error del servidor"));

            await renderDetail(HOUSE_EVENT, "Coordinador");

            await clickEliminar();
            await clickConfirmEliminar();

            await screen.findByText("Error del servidor");

            await clickCancelar();

            expect(
                screen.queryByText("Error del servidor"),
            ).not.toBeInTheDocument();
        });
    });
});
