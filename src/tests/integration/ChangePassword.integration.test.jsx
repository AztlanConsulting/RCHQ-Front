import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ChangePassword from "../../../src/Pages/Auth/ChangePassword";

const mockNavigate = vi.fn();
const mockLogin = vi.fn();

vi.mock("react-router-dom", async (importOriginal) => {
    const actual = await importOriginal();
    return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("../../../src/hooks/useAuth", () => ({
    default: () => ({ login: mockLogin }),
}));

vi.mock("../../../src/utils/authStorage", () => ({
    getFirstLoginToken: vi.fn(),
}));

vi.mock("../../../src/Services/PasswordService", () => ({
    changePasswordFirstLoginService: vi.fn(),
}));

vi.mock("../../../src/utils/password/passwordErrorMapper", () => ({
    mapPasswordApiError: vi.fn(() => ["La nueva contraseña debe ser diferente a la temporal"]),
}));

import { getFirstLoginToken } from "../../../src/utils/authStorage";
import { changePasswordFirstLoginService } from "../../../src/Services/PasswordService";

const renderPage = () =>
    render(
        <MemoryRouter>
            <ChangePassword />
        </MemoryRouter>,
    );

const fillAndSubmit = async (newPassword, confirmPassword) => {
    const inputs = screen.getAllByDisplayValue("");
    fireEvent.change(inputs[0], { target: { value: newPassword } });
    fireEvent.change(inputs[1], { target: { value: confirmPassword } });
    fireEvent.click(screen.getByRole("button", { name: /cambiar contraseña/i }));
};

beforeEach(() => {
    vi.clearAllMocks();
    getFirstLoginToken.mockReturnValue("first-login-token");
});

describe("ChangePassword — integración", () => {
    it("redirige a iniciar sesión si no hay first login token", () => {
        getFirstLoginToken.mockReturnValue(null);

        renderPage();

        expect(mockNavigate).toHaveBeenCalledWith("/iniciar-sesion", { replace: true });
    });

    it("muestra error de validación cuando los campos no son válidos", async () => {
        renderPage();

        await fillAndSubmit("abc", "abc");

        await waitFor(() => {
            expect(
                screen.getByText(/no cumple con los requisitos indicados/i),
            ).toBeInTheDocument();
        });

        expect(changePasswordFirstLoginService).not.toHaveBeenCalled();
    });

    it("hace login y navega al dashboard cuando el cambio es exitoso", async () => {
        changePasswordFirstLoginService.mockResolvedValue({
            success: true,
            data: {
                token: "session-token",
                user: { employeeId: 1, name: "Test User" },
            },
        });

        renderPage();
        await fillAndSubmit("NuevaPass123", "NuevaPass123");

        await waitFor(() => {
            expect(changePasswordFirstLoginService).toHaveBeenCalledWith(
                "NuevaPass123",
                "NuevaPass123",
            );
            expect(mockLogin).toHaveBeenCalledWith({
                token: "session-token",
                user: { employeeId: 1, name: "Test User" },
            });
            expect(mockNavigate).toHaveBeenCalledWith("/app/dashboard", {
                replace: true,
            });
        });
    });

    it("navega a /2FA cuando el backend indica VERIFY_2FA", async () => {
        changePasswordFirstLoginService.mockResolvedValue({
            success: true,
            nextStep: "VERIFY_2FA",
            data: {
                pre2FAToken: "pre-2fa-token",
            },
        });

        renderPage();
        await fillAndSubmit("NuevaPass123", "NuevaPass123");

        await waitFor(() => {
            expect(localStorage.getItem("PRE_2FA")).toBe("pre-2fa-token");
            expect(mockNavigate).toHaveBeenCalledWith("/2FA", { replace: true });
        });
    });

    it("muestra error mapeado cuando el servicio falla", async () => {
        changePasswordFirstLoginService.mockRejectedValue(new Error("backend error"));

        renderPage();
        await fillAndSubmit("NuevaPass123", "NuevaPass123");

        await waitFor(() => {
            expect(
                screen.getByText(/debe ser diferente a la temporal/i),
            ).toBeInTheDocument();
        });
    });
});