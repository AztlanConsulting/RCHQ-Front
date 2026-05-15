import React from "react";
import { render, screen, fireEvent, renderHook } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import DateField from "../../components/atoms/dateField";
import { useDateField } from "../../hooks/atoms/useDateField";

vi.mock("flowbite-react", () => ({
    Datepicker: ({ value, onChange }) => (
        <div data-testid="mock-datepicker" data-value={value?.toISOString()}>
            <button
                data-testid="simulate-select-date"
                onClick={() => onChange(new Date(2024, 4, 5))}
            >
                Seleccionar Fecha
            </button>
            <button
                data-testid="simulate-clear-date"
                onClick={() => onChange(null)}
            >
                Limpiar Fecha
            </button>
        </div>
    ),
}));

describe("Pruebas Unitarias: DateField y useDateField", () => {
    describe("Componente DateField", () => {
        const mockOnChange = vi.fn();

        beforeEach(() => {
            vi.clearAllMocks();
        });

        it("debe renderizar el label correctamente", () => {
            render(
                <DateField
                    label="Fecha de nacimiento"
                    name="birthDate"
                    onChange={mockOnChange}
                />,
            );
            expect(screen.getByText("Fecha de nacimiento")).toBeInTheDocument();
        });

        it("debe inicializar la fecha añadiendo T12:00:00 para evitar desfases horarios", () => {
            render(
                <DateField
                    label="Fecha"
                    name="testDate"
                    value="2023-10-15"
                    onChange={mockOnChange}
                />,
            );

            const datepicker = screen.getByTestId("mock-datepicker");
            const expectedDate = new Date("2023-10-15T12:00:00");
            expect(datepicker).toHaveAttribute(
                "data-value",
                expectedDate.toISOString(),
            );
        });

        it("debe formatear la fecha a YYYY-MM-DD cuando el usuario selecciona una fecha", () => {
            render(
                <DateField
                    label="Fecha"
                    name="testDate"
                    onChange={mockOnChange}
                />,
            );

            fireEvent.click(screen.getByTestId("simulate-select-date"));

            expect(mockOnChange).toHaveBeenCalledWith({
                target: {
                    name: "testDate",
                    value: "2024-05-05",
                },
            });
        });

        it("debe retornar un string vacío si la fecha se limpia (null/undefined)", () => {
            render(
                <DateField
                    label="Fecha"
                    name="testDate"
                    onChange={mockOnChange}
                />,
            );

            fireEvent.click(screen.getByTestId("simulate-clear-date"));

            expect(mockOnChange).toHaveBeenCalledWith({
                target: {
                    name: "testDate",
                    value: "",
                },
            });
        });

        it("debe renderizar un input nativo cuando native=true", () => {
            render(
                <DateField
                    native
                    label="Fecha"
                    name="testDate"
                    value="2026-05-18"
                    onChange={mockOnChange}
                />,
            );

            expect(screen.getByDisplayValue("2026-05-18")).toHaveAttribute(
                "type",
                "date",
            );
        });
    });

    describe("Hook useDateField", () => {
        let mutationCallback;

        beforeEach(() => {
            vi.useFakeTimers();

            global.MutationObserver = class {
                constructor(callback) {
                    mutationCallback = callback;
                }
                observe() {}
                disconnect() {}
            };

            document.body.innerHTML = "";
        });

        afterEach(() => {
            vi.runOnlyPendingTimers();
            vi.useRealTimers();
        });

        it("debe identificar los días fuera del mes y aplicar la clase 'outside-month-day'", () => {
            document.body.innerHTML = `
                <div class="mb-2 flex justify-between">Mayo 2024</div>
                <div>
                    <button type="button">29</button>
                    <button type="button">30</button>
                    ${Array.from({ length: 31 }, (_, i) => `<button type="button">${i + 1}</button>`).join("")}
                    <button type="button">1</button>
                    <button type="button">2</button>
                </div>
            `;

            renderHook(() => useDateField());

            mutationCallback([{ type: "childList" }]);

            vi.advanceTimersByTime(50);

            const buttons = document.querySelectorAll('button[type="button"]');

            expect(buttons[0]).toHaveClass("outside-month-day");
            expect(buttons[1]).toHaveClass("outside-month-day");
            expect(buttons[2]).not.toHaveClass("outside-month-day");
            expect(buttons[32]).not.toHaveClass("outside-month-day");
            expect(buttons[33]).toHaveClass("outside-month-day");
        });

        it("debe ignorar si no hay elementos del calendario en el DOM", () => {
            renderHook(() => useDateField());
            mutationCallback([{ type: "childList" }]);
            vi.advanceTimersByTime(50);

            expect(
                document.querySelectorAll('button[type="button"]'),
            ).toHaveLength(0);
        });
    });
});
