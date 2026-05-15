import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";
import AppLayout from "../../components/appLayout";

// ─── Mocks ────────────────────────────────────────────────────────────────────
vi.mock("../../components/organism/sideBar", () => ({
    default: () => <div data-testid="sidebar" />,
}));

vi.mock("../../hooks/useAuth", () => ({
    default: () => ({ logout: vi.fn() }),
}));

const renderAppLayout = (
    ui = <div data-testid="outlet-content">Contenido</div>,
) =>
    render(
        <MemoryRouter initialEntries={["/app"]}>
            <Routes>
                <Route path="/app" element={<AppLayout />}>
                    <Route index element={ui} />
                </Route>
            </Routes>
        </MemoryRouter>,
    );

describe("AppLayout", () => {
    it("renderiza el sidebar", () => {
        renderAppLayout();
        expect(screen.getByTestId("sidebar")).toBeTruthy();
    });

    it("renderiza el contenido del outlet", () => {
        renderAppLayout();
        expect(screen.getByTestId("outlet-content")).toBeTruthy();
    });

    it("el main tiene padding top mobile (pt-20)", () => {
        renderAppLayout();
        const main = screen.getByRole("main");
        expect(main.className).toContain("pt-20");
    });

    it("el main tiene padding top desktop (md:pt-4)", () => {
        renderAppLayout();
        const main = screen.getByRole("main");
        expect(main.className).toContain("md:pt-4");
    });

    it("el main tiene padding left solo en desktop (md:pl-[104px])", () => {
        renderAppLayout();
        const main = screen.getByRole("main");
        expect(main.className).toContain("md:pl-[104px]");
        // No debe tener paddingLeft inline
        expect(main.style.paddingLeft).toBe("");
    });

    it("el contenedor raíz ocupa toda la pantalla", () => {
        renderAppLayout();
        const main = screen.getByRole("main");
        const container = main.parentElement;
        expect(container.className).toContain("h-screen");
    });
});
