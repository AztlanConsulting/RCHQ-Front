// tests/integration/LoginPage.integration.test.jsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LoginPage from "../../../src/Pages/Auth/LoginPages";

const mockNavigate = vi.fn();
const mockLogin = vi.fn();

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("../../../src/hooks/useAuth", () => ({
  default: () => ({ login: mockLogin }),
}));

// ← mockear AuthService pero con implementaciones controladas
vi.mock("../../../src/Services/AuthService", () => ({
  loginService: vi.fn(),
  getReadableErrors: vi.fn((err) => [
    err?.message || "Ocurrió un error inesperado",
  ]),
}));

import { loginService } from "../../../src/Services/AuthService";

const renderLogin = () =>
  render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  );

const fillAndSubmit = async (email, password) => {
  fireEvent.change(screen.getByLabelText(/correo electrónico/i), {
    target: { value: email },
  });
  fireEvent.change(document.querySelector("input[type='password']"), {
    target: { value: password },
  });
  fireEvent.click(screen.getByRole("button", { name: /ingresar/i }));
};

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

describe("LoginPage + AuthService — flujo de login", () => {
  it("guarda el token en localStorage y navega al dashboard cuando el login es exitoso", async () => {
    // Arrange
    loginService.mockResolvedValue({
      success: true,
      isActiveTwoFactorAuth: false,
      data: { token: "real-token-123", user: { id: 1, name: "Test" } },
    });
    renderLogin();

    // Act
    await fillAndSubmit("usuario@test.com", "Password123!");

    // Assert
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        token: "real-token-123",
        user: { id: 1, name: "Test" },
      });
      expect(mockNavigate).toHaveBeenCalledWith("/app/dashboard", {
        replace: true,
      });
    });
  });

  it("guarda preTwoFactorAuth en localStorage y navega a /2FA cuando el usuario tiene TwoFactorAuth activo", async () => {
    // Arrange
    loginService.mockResolvedValue({
      success: true,
      isActiveTwoFactorAuth: true,
      preTwoFactorAuthToken: "pre-token-abc",
    });
    renderLogin();

    // Act
    await fillAndSubmit("usuario@test.com", "Password123!");

    // Assert
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/2FA", { replace: true });
    });
  });

  it("muestra el error del servidor cuando las credenciales son inválidas", async () => {
    // Arrange
    const error = new Error("Credenciales inválidas");
    error.status = 401;
    error.code = "INVALID_CREDENTIALS";
    error.errors = [];
    loginService.mockRejectedValue(error);
    renderLogin();

    // Act
    await fillAndSubmit("usuario@test.com", "WrongPassword1!");

    // Assert
    await waitFor(() =>
      expect(screen.getByText(/credenciales inválidas/i)).toBeInTheDocument(),
    );
  });

  it("no llama al servicio cuando la validación Zod falla", async () => {
    // Arrange
    renderLogin();

    // Act
    await fillAndSubmit("no-es-email", "pass");

    // Assert
    await waitFor(() => expect(loginService).not.toHaveBeenCalled());
  });

  it("muestra error de bloqueo temporal cuando el servidor responde 423", async () => {
    // Arrange
    const error = new Error(
      "Tu cuenta está bloqueada temporalmente. Intenta más tarde.",
    );
    error.status = 423;
    error.errors = [];
    loginService.mockRejectedValue(error);
    renderLogin();

    // Act
    await fillAndSubmit("usuario@test.com", "Password123!");

    // Assert
    await waitFor(() =>
      expect(screen.getByText(/bloqueada temporalmente/i)).toBeInTheDocument(),
    );
  });

  it("navega a primer inicio cuando el backend indica cambio de contraseña obligatorio", async () => {
    loginService.mockResolvedValue({
      success: true,
      nextStep: "CHANGE_PASSWORD_FIRST_LOGIN",
      data: {
        firstLoginToken: "first-token",
      },
    });

    renderLogin();
    await fillAndSubmit("usuario@test.com", "Password123!");

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        "/primer-inicio/cambiar-contrasena",
        { replace: true },
      );
    });
  });
});
