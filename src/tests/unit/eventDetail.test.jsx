import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import EventDetail from "../../components/molecules/calendarCards/eventDetail";

const buildEvent = (overrides = {}) => ({
    eventId: "training-001",
    title: "Capacitacion interna",
    scope: "personal",
    scopeLabel: "Personal",
    focus: "eventos",
    focusLabel: "Eventos",
    eventType: "Capacitaciones",
    trainer: "Ana",
    description: "Sesion de practica",
    allDay: false,
    start: "2026-05-10T09:00:00.000Z",
    end: "2026-05-10T10:00:00.000Z",
    backgroundColor: "#4A90D9",
    borderColor: "#4A90D9",
    peopleInsideEvent: [],
    ...overrides,
});

describe("EventDetail", () => {
    it("aplica clases de quiebre para titulos e instructores con palabras largas", () => {
        const longWord = "SupercapacitacionSinEspacios".repeat(5);

        render(
            <EventDetail
                event={buildEvent({
                    title: longWord,
                    trainer: longWord,
                })}
                viewerRole="Coordinador"
                onEdit={vi.fn()}
                onDelete={vi.fn()}
            />,
        );

        const title = screen.getByRole("heading", { level: 2 });
        const [, trainer] = screen.getAllByText(longWord);

        expect(title).toHaveTextContent(longWord);
        expect(title.className).toContain("whitespace-pre-wrap");
        expect(title.className).toContain("break-words");
        expect(title.className).toContain("[overflow-wrap:anywhere]");
        expect(trainer.className).toContain("[overflow-wrap:anywhere]");
    });

    it("omite la etiqueta de capacitador cuando la capacitacion no tiene instructor", () => {
        render(
            <EventDetail
                event={buildEvent({ trainer: "" })}
                viewerRole="Mantenimiento"
                onEdit={vi.fn()}
                onDelete={vi.fn()}
            />,
        );

        expect(screen.queryByText(/capacitador:/i)).not.toBeInTheDocument();
        expect(
            screen.queryByRole("button", { name: /editar/i }),
        ).not.toBeInTheDocument();
        expect(
            screen.queryByRole("button", { name: /eliminar/i }),
        ).not.toBeInTheDocument();
    });

    it("omite la etiqueta de capacitador cuando el tipo de evento no es capacitaciones", () => {
        render(
            <EventDetail
                event={buildEvent({
                    eventType: "Reunion",
                    trainer: "Dra. Campos",
                })}
                viewerRole="Coordinador"
                onEdit={vi.fn()}
                onDelete={vi.fn()}
            />,
        );

        expect(screen.queryByText(/capacitador:/i)).not.toBeInTheDocument();
        expect(screen.queryByText("Dra. Campos")).not.toBeInTheDocument();
        expect(screen.getByText("Eventos · Reunion")).toBeInTheDocument();
    });

    it("muestra correctamente los datos cortos de una capacitacion", () => {
        render(
            <EventDetail
                event={buildEvent({
                    title: "Curso",
                    trainer: "Leo",
                    description: "Intro",
                })}
                viewerRole="Coordinador"
                onEdit={vi.fn()}
                onDelete={vi.fn()}
            />,
        );

        expect(
            screen.getByRole("heading", { name: "Curso" }),
        ).toBeInTheDocument();
        expect(screen.getByText("Personal")).toBeInTheDocument();
        expect(screen.getByText("Eventos · Capacitaciones")).toBeInTheDocument();
        expect(screen.getByText("Leo")).toBeInTheDocument();
        expect(screen.getByText("Intro")).toBeInTheDocument();
    });

    it("oculta acciones y permite expandir la lista de empleados ligados", () => {
        render(
            <EventDetail
                event={buildEvent({
                    peopleInsideEvent: [
                        { id: "emp-1", name: "Empleado 1" },
                        { id: "emp-2", name: "Empleado 2" },
                        { id: "emp-3", name: "Empleado 3" },
                        { id: "emp-4", name: "Empleado 4" },
                        { id: "emp-5", name: "Empleado 5" },
                        { id: "emp-6", name: "Empleado 6" },
                    ],
                })}
                viewerRole="Coordinador"
                hideActions
                onEdit={vi.fn()}
                onDelete={vi.fn()}
            />,
        );

        expect(screen.getByText("Empleado 1")).toBeInTheDocument();
        expect(screen.getByText("Empleado 5")).toBeInTheDocument();
        expect(screen.queryByText("Empleado 6")).not.toBeInTheDocument();
        expect(
            screen.queryByRole("button", { name: /editar/i }),
        ).not.toBeInTheDocument();
        expect(
            screen.queryByRole("button", { name: /eliminar/i }),
        ).not.toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: /ver 1 más/i }));

        expect(screen.getByText("Empleado 6")).toBeInTheDocument();
    });
});
