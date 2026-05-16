// tests/unit/timeField.test.jsx
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import TimeField from "../../components/atoms/timeField";
import { useTimeField } from "../../hooks/atoms/useTimeField";

vi.mock("../../hooks/atoms/useTimeField", () => ({
    useTimeField: vi.fn(),
}));

vi.mock("/time.svg", () => ({
    default: "/time.svg",
}));

vi.mock("/chevron-down.svg", () => ({
    default: "/chevron-down.svg",
}));

describe("TimeField", () => {
    const mockHandleOpen = vi.fn();
    const mockHandleSelect = vi.fn();

    const defaultHookReturn = {
        isOpen: false,
        dropdownPos: {
            top: 100,
            left: 50,
            width: 200,
        },
        containerRef: { current: null },
        dropdownRef: { current: null },
        listRef: { current: null },
        times: [
            { label: "9:00 AM", value: "09:00" },
            { label: "9:15 AM", value: "09:15" },
            { label: "10:00 AM", value: "10:00" },
        ],
        selectedLabel: "",
        handleOpen: mockHandleOpen,
        handleSelect: mockHandleSelect,
    };

    beforeEach(() => {
        vi.clearAllMocks();
        useTimeField.mockReturnValue(defaultHookReturn);
    });

    it("debe renderizar el placeholder cuando no hay valor seleccionado", () => {
        render(<TimeField placeholder="Hora inicio" />);

        expect(screen.getByText("Hora inicio")).toBeInTheDocument();
    });

    it("debe renderizar la hora seleccionada cuando existe selectedLabel", () => {
        useTimeField.mockReturnValue({
            ...defaultHookReturn,
            selectedLabel: "9:00 AM",
        });

        render(<TimeField value="09:00" />);

        expect(screen.getByText("9:00 AM")).toBeInTheDocument();
    });

    it("debe llamar a handleOpen al hacer click en el botón", () => {
        render(<TimeField />);

        const button = screen.getByRole("button");

        fireEvent.click(button);

        expect(mockHandleOpen).toHaveBeenCalledTimes(1);
    });

    it("debe deshabilitar el botón cuando disabled es true", () => {
        render(<TimeField disabled />);

        const button = screen.getByRole("button");

        expect(button).toBeDisabled();
    });

    it("debe mostrar mensaje de error cuando recibe error", () => {
        render(<TimeField error="La hora es obligatoria" />);

        expect(screen.getByText("La hora es obligatoria")).toBeInTheDocument();
    });

    it("debe aplicar aria-expanded false cuando el dropdown está cerrado", () => {
        render(<TimeField />);

        const button = screen.getByRole("button");

        expect(button).toHaveAttribute("aria-expanded", "false");
    });

    it("debe renderizar las opciones cuando isOpen es true", () => {
        useTimeField.mockReturnValue({
            ...defaultHookReturn,
            isOpen: true,
        });

        render(<TimeField />);

        expect(screen.getByRole("listbox")).toBeInTheDocument();
        expect(screen.getByText("9:00 AM")).toBeInTheDocument();
        expect(screen.getByText("9:15 AM")).toBeInTheDocument();
        expect(screen.getByText("10:00 AM")).toBeInTheDocument();
    });

    it("debe llamar a handleSelect cuando se selecciona una opción", () => {
        useTimeField.mockReturnValue({
            ...defaultHookReturn,
            isOpen: true,
        });

        render(<TimeField />);

        fireEvent.click(screen.getByText("9:15 AM"));

        expect(mockHandleSelect).toHaveBeenCalledWith("09:15");
    });

    it("debe marcar como seleccionada la opción que coincide con value", () => {
        useTimeField.mockReturnValue({
            ...defaultHookReturn,
            isOpen: true,
            selectedLabel: "9:15 AM",
        });
        render(<TimeField value="09:15" />);
        const selectedOption = screen.getByRole("option", {
            name: "9:15 AM",
        });
        expect(selectedOption).toHaveAttribute("aria-selected", "true");
        expect(selectedOption).toHaveAttribute("data-active", "true");
    });

    it("debe llamar useTimeField con las props correctas", () => {
        const onChange = vi.fn();

        render(
            <TimeField
                value="09:00"
                onChange={onChange}
                minTime="08:00"
                disabled={false}
            />,
        );

        expect(useTimeField).toHaveBeenCalledWith({
            value: "09:00",
            minTime: "08:00",
            disabled: false,
            onChange,
        });
    });
});
