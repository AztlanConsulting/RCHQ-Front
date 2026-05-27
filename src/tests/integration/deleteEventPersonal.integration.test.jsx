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
import { deletePersonalEvent } from "../../services/deleteEventService";

vi.mock("../../services/deleteEventService", () => ({
    deletePersonalEvent: vi.fn(),
}));


const PERSONAL_EVENT = {
    eventId: "personal-evt-001",
    title: "Reunión de equipo",
    scope: "personal",
    scopeLabel: "Personal",
    focus: "eventos",
    focusLabel: "Eventos",
    eventType: "Reunión",
    allDay: false,
    start: "2026-05-10T09:00:00",
    end: "2026-05-10T10:00:00",
    description: "Reunión semanal del equipo.",
    borderColor: "#4A90D9",
    backgroundColor: "#4A90D9",
};

const HOUSE_EVENT = {
    ...PERSONAL_EVENT,
    eventId: undefined,
    houseEventId: "house-evt-001",
    title: "Limpieza semanal",
    scope: "house",
    scopeLabel: "Casa",
};

const GLOBAL_EVENT = {
    ...PERSONAL_EVENT,
    eventId: "global-evt-001",
    title: "Evento corporativo",
    scope: "global",
    scopeLabel: "Global",
};


const EventDetailWithDelete = ({ event, viewerRole, onSuccess = vi.fn() }) => {
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState("");

    const handleConfirmDelete = async () => {
        const id = event?.eventId;
        if (!id) return;

        setIsDeleting(true);
        setDeleteError("");

        try {
            await deletePersonalEvent(id);
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


const renderDetail = async (
    event = PERSONAL_EVENT,
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

const clickEliminar = async () => {
    await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /^eliminar$/i }));
    });
};

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


describe("Integración: eliminar evento de personal", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();

        deletePersonalEvent.mockResolvedValue({ success: true });
    });


    describe("visibilidad de botones según rol", () => {
        it("muestra Eliminar y Editar al Coordinador en evento personal", async () => {
            await renderDetail(PERSONAL_EVENT, "Coordinador");

            expect(
                screen.getByRole("button", { name: /^eliminar$/i }),
            ).toBeInTheDocument();
            expect(
                screen.getByRole("button", { name: /^editar$/i }),
            ).toBeInTheDocument();
        });

        it("muestra 5 empleados ligados y permite ver el resto", async () => {
            const peopleInsideEvent = Array.from({ length: 6 }, (_, index) => ({
                id: `emp-${index + 1}`,
                name: `Empleado ${index + 1}`,
            }));

            await renderDetail(
                { ...PERSONAL_EVENT, peopleInsideEvent },
                "Coordinador",
            );

            expect(screen.getByText("Empleado 1")).toBeInTheDocument();
            expect(screen.getByText("Empleado 5")).toBeInTheDocument();
            expect(screen.queryByText("Empleado 6")).not.toBeInTheDocument();

            fireEvent.click(screen.getByRole("button", { name: /ver 1/i }));

            expect(screen.getByText("Empleado 6")).toBeInTheDocument();
            expect(
                screen.getByRole("button", { name: /ver menos/i }),
            ).toBeInTheDocument();
        });

        it("oculta Eliminar y Editar a roles sin permiso en evento personal", async () => {
            await renderDetail(PERSONAL_EVENT, "Empleado");

            expect(
                screen.queryByRole("button", { name: /^eliminar$/i }),
            ).not.toBeInTheDocument();
            expect(
                screen.queryByRole("button", { name: /^editar$/i }),
            ).not.toBeInTheDocument();
        });

        it("oculta Eliminar y Editar al Administrador en evento personal", async () => {
            await renderDetail(PERSONAL_EVENT, "Administrador");

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


    describe("flujo de confirmación de eliminación", () => {
        it("muestra el modal de confirmación con el nombre del evento al hacer clic en Eliminar", async () => {
            await renderDetail(PERSONAL_EVENT, "Coordinador");

            await clickEliminar();

            const dialog = screen.getByRole("dialog");
            expect(within(dialog).getByText(/eliminar evento/i)).toBeInTheDocument();
            expect(within(dialog).getByText(/Reunión de equipo/)).toBeInTheDocument();
        });

        it("cierra el modal de confirmación al hacer clic en Cancelar", async () => {
            await renderDetail(PERSONAL_EVENT, "Coordinador");

            await clickEliminar();
            expect(screen.getByText(/eliminar evento/i)).toBeInTheDocument();

            await clickCancelar();

            expect(
                screen.queryByText(/eliminar evento/i),
            ).not.toBeInTheDocument();
        });

        it("no llama al servicio si se cancela la confirmación", async () => {
            await renderDetail(PERSONAL_EVENT, "Coordinador");

            await clickEliminar();
            await clickCancelar();

            expect(deletePersonalEvent).not.toHaveBeenCalled();
        });
    });


    describe("llamada al servicio deletePersonalEvent", () => {
        it("llama a deletePersonalEvent con el eventId correcto al confirmar", async () => {
            await renderDetail(PERSONAL_EVENT, "Coordinador");

            await clickEliminar();
            await clickConfirmEliminar();

            await waitFor(() => {
                expect(deletePersonalEvent).toHaveBeenCalledTimes(1);
            });

            expect(deletePersonalEvent).toHaveBeenCalledWith("personal-evt-001");
        });

        it("llama a onSuccess tras eliminar exitosamente", async () => {
            const onSuccess = vi.fn();
            await renderDetail(PERSONAL_EVENT, "Coordinador", onSuccess);

            await clickEliminar();
            await clickConfirmEliminar();

            await waitFor(() => {
                expect(onSuccess).toHaveBeenCalledTimes(1);
            });
        });

        it("cierra la confirmación tras eliminar exitosamente", async () => {
            await renderDetail(PERSONAL_EVENT, "Coordinador");

            await clickEliminar();
            await clickConfirmEliminar();

            await waitFor(() => {
                expect(deletePersonalEvent).toHaveBeenCalledTimes(1);
            });

            expect(
                screen.queryByText(/eliminar evento/i),
            ).not.toBeInTheDocument();
        });

        it("no llama a deletePersonalEvent si el evento no tiene eventId", async () => {
            const eventSinId = { ...PERSONAL_EVENT, eventId: undefined };
            await renderDetail(eventSinId, "Coordinador");

            await clickEliminar();
            await clickConfirmEliminar();

            await waitFor(() => {
                expect(deletePersonalEvent).not.toHaveBeenCalled();
            });
        });
    });


    describe("manejo de errores", () => {
        it("muestra el mensaje de error si deletePersonalEvent falla", async () => {
            deletePersonalEvent.mockRejectedValueOnce(
                new Error("No se pudo eliminar el evento de personal"),
            );

            await renderDetail(PERSONAL_EVENT, "Coordinador");

            await clickEliminar();
            await clickConfirmEliminar();

            expect(
                await screen.findByText("No se pudo eliminar el evento de personal"),
            ).toBeInTheDocument();
        });

        it("no llama a onSuccess si deletePersonalEvent falla", async () => {
            deletePersonalEvent.mockRejectedValueOnce(new Error("Error del servidor"));

            const onSuccess = vi.fn();
            await renderDetail(PERSONAL_EVENT, "Coordinador", onSuccess);

            await clickEliminar();
            await clickConfirmEliminar();

            await waitFor(() => {
                expect(deletePersonalEvent).toHaveBeenCalledTimes(1);
            });

            expect(onSuccess).not.toHaveBeenCalled();
        });

        it("mantiene la confirmación abierta si el servicio falla", async () => {
            deletePersonalEvent.mockRejectedValueOnce(new Error("Error del servidor"));

            await renderDetail(PERSONAL_EVENT, "Coordinador");

            await clickEliminar();
            await clickConfirmEliminar();

            expect(
                await screen.findByText(/eliminar evento/i),
            ).toBeInTheDocument();
        });

        it("limpia el error al cancelar después de un fallo", async () => {
            deletePersonalEvent.mockRejectedValueOnce(new Error("Error del servidor"));

            await renderDetail(PERSONAL_EVENT, "Coordinador");

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
