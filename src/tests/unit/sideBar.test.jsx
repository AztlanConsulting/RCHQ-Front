// src/tests/unit/sideBar.test.jsx
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ─── Mock mutable de useSideBar ───────────────────────────────────────────────
const mockUseSideBar = {
    expanded: false,
    toggle: vi.fn(),
    mobileOpen: false,
    openMobile: vi.fn(),
    closeMobile: vi.fn(),
};

vi.mock("../../hooks/organism/useSideBar", () => ({
    default: () => mockUseSideBar,
}));

vi.mock("../../hooks/useAuth", () => ({
    default: () => ({ logout: vi.fn() }),
}));

import SideBar from "../../components/organism/sideBar";

// ─── Helper ───────────────────────────────────────────────────────────────────
const renderSideBar = () =>
    render(
        <MemoryRouter>
            <SideBar />
        </MemoryRouter>,
    );

// ─── Tests colapsado (default) ────────────────────────────────────────────────
describe("SideBar", () => {
    it("renderiza el título TOCHAN", () => {
        renderSideBar();
        expect(screen.getAllByText("TOCHAN").length).toBeGreaterThan(0);
    });

    it("renderiza todos los nav items", () => {
        renderSideBar();
        const labels = [
            "Calendario",
            "Personal",
            "Casas Hogares",
            "Vacaciones",
            "Ausencias",
            "Donaciones",
        ];
        labels.forEach((label) => {
            expect(
                screen.getAllByRole("link", { name: label }).length,
            ).toBeGreaterThan(0);
        });
    });

    it("renderiza Perfil y Cerrar Sesión", () => {
        renderSideBar();
        expect(
            screen.getAllByRole("link", { name: "Perfil" }).length,
        ).toBeGreaterThan(0);
        expect(
            screen.getAllByRole("button", { name: "Cerrar Sesión" }).length,
        ).toBeGreaterThan(0);
    });

    it("el botón expandir tiene aria-label correcto cuando está colapsado", () => {
        renderSideBar();
        expect(
            screen.getByRole("button", { name: "Expandir menú" }),
        ).toBeTruthy();
    });

    it("el botón hamburguesa mobile tiene aria-label correcto", () => {
        renderSideBar();
        expect(screen.getByRole("button", { name: "Abrir menú" })).toBeTruthy();
    });
});

// ─── Tests expandido ──────────────────────────────────────────────────────────
describe("SideBar expandida", () => {
    beforeEach(() => {
        mockUseSideBar.expanded = true;
    });

    afterEach(() => {
        mockUseSideBar.expanded = false;
    });

    it("el botón toggle tiene aria-label Contraer menú", () => {
        renderSideBar();
        expect(
            screen.getByRole("button", { name: "Contraer menú" }),
        ).toBeTruthy();
    });

    it("el botón toggle tiene aria-expanded true", () => {
        renderSideBar();
        const btn = screen.getByRole("button", { name: "Contraer menú" });
        expect(btn).toHaveAttribute("aria-expanded", "true");
    });
});

// ─── Tests mobile abierta ─────────────────────────────────────────────────────
describe("SideBar mobile abierta", () => {
    beforeEach(() => {
        mockUseSideBar.mobileOpen = true;
    });

    afterEach(() => {
        mockUseSideBar.mobileOpen = false;
    });

    it("muestra el nav mobile", () => {
        renderSideBar();
        expect(
            screen.getByRole("navigation", { name: "Menú principal" }),
        ).toBeTruthy();
    });

    it("el botón hamburguesa cambia a Cerrar menú", () => {
        renderSideBar();
        expect(
            screen.getByRole("button", { name: "Cerrar menú" }),
        ).toBeTruthy();
    });

    it("el botón hamburguesa tiene aria-expanded true", () => {
        renderSideBar();
        const btn = screen.getByRole("button", { name: "Cerrar menú" });
        expect(btn).toHaveAttribute("aria-expanded", "true");
    });
});
