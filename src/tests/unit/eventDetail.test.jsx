import { render, screen } from "@testing-library/react";
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
});
