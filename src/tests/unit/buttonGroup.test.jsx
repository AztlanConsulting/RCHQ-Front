// src/tests/unit/buttonGroup.test.jsx
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import ButtonGroup from "../../components/molecules/buttonGroup";

vi.mock("/absence-black.svg", () => ({ default: "/absence-black.svg" }));
vi.mock("/global-black.svg", () => ({ default: "/global-black.svg" }));
vi.mock("/house-black.svg", () => ({ default: "/house-black.svg" }));
vi.mock("/personal-black.svg", () => ({ default: "/personal-black.svg" }));
vi.mock("/vacation-black.svg", () => ({ default: "/vacation-black.svg" }));

describe("ButtonGroup", () => {
    const options = [
        { value: "global", label: "Global", icon: "globe" },
        { value: "casa", label: "Casa", icon: "home" },
        { value: "personal", label: "Personal", icon: "user" },
        { value: "vacaciones", label: "Vacaciones", icon: "plane" },
        { value: "ausencias", label: "Ausencias", icon: "flag" },
    ];

    const onChange = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("debe renderizar todas las opciones", () => {
        render(
            <ButtonGroup options={options} value="casa" onChange={onChange} />,
        );

        expect(screen.getByRole("group")).toBeInTheDocument();
        expect(
            screen.getByRole("radio", { name: "Global" }),
        ).toBeInTheDocument();
        expect(screen.getByRole("radio", { name: "Casa" })).toBeInTheDocument();
        expect(
            screen.getByRole("radio", { name: "Personal" }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("radio", { name: "Vacaciones" }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("radio", { name: "Ausencias" }),
        ).toBeInTheDocument();
    });

    it("debe marcar como activa la opción seleccionada", () => {
        render(
            <ButtonGroup
                options={options}
                value="vacaciones"
                onChange={onChange}
            />,
        );

        const activeButton = screen.getByRole("radio", {
            name: "Vacaciones",
        });

        expect(activeButton).toHaveAttribute("aria-checked", "true");
        expect(activeButton).toHaveStyle({
            background: "#1E3A5F",
            color: "#ffffff",
        });
    });

    it("debe marcar como inactiva una opción no seleccionada", () => {
        render(
            <ButtonGroup options={options} value="casa" onChange={onChange} />,
        );

        const inactiveButton = screen.getByRole("radio", {
            name: "Global",
        });

        expect(inactiveButton).toHaveAttribute("aria-checked", "false");
        expect(inactiveButton).toHaveStyle({
            background: "#f8fafc",
            color: "#000000",
        });
    });

    it("debe llamar onChange con el value correcto al hacer click", () => {
        render(
            <ButtonGroup options={options} value="casa" onChange={onChange} />,
        );

        fireEvent.click(screen.getByRole("radio", { name: "Personal" }));

        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenCalledWith("personal");
    });

    it("no debe llamar onChange cuando está disabled", () => {
        render(
            <ButtonGroup
                options={options}
                value="casa"
                onChange={onChange}
                disabled
            />,
        );

        fireEvent.click(screen.getByRole("radio", { name: "Personal" }));

        expect(onChange).not.toHaveBeenCalled();
        expect(screen.getByRole("radio", { name: "Personal" })).toBeDisabled();
    });

    it("debe renderizar los iconos correspondientes", () => {
        const { container } = render(
            <ButtonGroup options={options} value="casa" onChange={onChange} />,
        );

        const icons = container.querySelectorAll("img");

        expect(icons).toHaveLength(5);
        expect(icons[0]).toHaveAttribute("src", "/global-black.svg");
        expect(icons[1]).toHaveAttribute("src", "/house-black.svg");
        expect(icons[2]).toHaveAttribute("src", "/personal-black.svg");
        expect(icons[3]).toHaveAttribute("src", "/vacation-black.svg");
        expect(icons[4]).toHaveAttribute("src", "/absence-black.svg");
    });

    it("debe aplicar filtro blanco al icono activo", () => {
        render(
            <ButtonGroup
                options={options}
                value="vacaciones"
                onChange={onChange}
            />,
        );

        const activeButton = screen.getByRole("radio", {
            name: "Vacaciones",
        });

        const activeIcon = activeButton.querySelector("img");

        expect(activeIcon).toHaveStyle({
            filter: "brightness(0) invert(1)",
        });
    });

    it("debe cambiar el fondo en hover cuando no está activo", () => {
        render(
            <ButtonGroup options={options} value="casa" onChange={onChange} />,
        );

        const globalButton = screen.getByRole("radio", {
            name: "Global",
        });

        fireEvent.mouseEnter(globalButton);
        expect(globalButton).toHaveStyle({
            background: "#f1f5f9",
        });

        fireEvent.mouseLeave(globalButton);
        expect(globalButton).toHaveStyle({
            background: "#f8fafc",
        });
    });
});
