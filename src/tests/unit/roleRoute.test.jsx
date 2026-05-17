import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import RoleRoute from "../../components/roleRoute";
import useAuth from "../../hooks/useAuth";

vi.mock("../../hooks/useAuth", () => ({
    default: vi.fn(),
}));

const renderRoleRoute = () => {
    return render(
        <MemoryRouter initialEntries={["/app/vacaciones/solicitudes"]}>
            <Routes>
                <Route
                    element={<RoleRoute allowedRoles={["Coordinador"]} />}
                >
                    <Route
                        path="/app/vacaciones/solicitudes"
                        element={<div>Solicitudes vacaciones</div>}
                    />
                </Route>

                <Route
                    path="/app/calendario"
                    element={<div>Calendario redirect</div>}
                />

                <Route
                    path="/iniciar-sesion"
                    element={<div>Login redirect</div>}
                />
            </Routes>
        </MemoryRouter>,
    );
};

describe("RoleRoute", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("permite acceso si el usuario está autenticado y tiene rol Coordinador", () => {
        useAuth.mockReturnValue({
            isAuthenticated: true,
            user: { role: { name: "Coordinador" } },
        });

        renderRoleRoute();

        expect(screen.getByText("Solicitudes vacaciones")).toBeInTheDocument();
    });

    it("redirige a login si el usuario no está autenticado", () => {
        useAuth.mockReturnValue({
            isAuthenticated: false,
            user: null,
        });

        renderRoleRoute();

        expect(screen.getByText("Login redirect")).toBeInTheDocument();
    });

    it("redirige a calendario si el usuario no tiene rol permitido", () => {
        useAuth.mockReturnValue({
            isAuthenticated: true,
            user: { role: { name: "Admin" } },
        });

        renderRoleRoute();

        expect(screen.getByText("Calendario redirect")).toBeInTheDocument();
    });

    it("soporta roleName plano", () => {
        useAuth.mockReturnValue({
            isAuthenticated: true,
            user: { roleName: "Coordinador" },
        });

        renderRoleRoute();

        expect(screen.getByText("Solicitudes vacaciones")).toBeInTheDocument();
    });

    it("soporta role como string", () => {
        useAuth.mockReturnValue({
            isAuthenticated: true,
            user: { role: "Coordinador" },
        });

        renderRoleRoute();

        expect(screen.getByText("Solicitudes vacaciones")).toBeInTheDocument();
    });
});
