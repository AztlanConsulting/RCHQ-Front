// tests/integration/TwoFactorLogin.integration.test.jsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import TwoFactorLogin from "../../../src/Pages/Auth/TwoFactorLogin";

const mockNavigate = vi.fn();
const mockLogin = vi.fn();

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("../../../src/context/AuthContext", () => ({
  useAuthContext: () => ({ login: mockLogin }),
}));

vi.mock("../../../src/Services/AuthService", () => ({
  validateLogin2FAService: vi.fn(),
  getPre2faToken: vi.fn(),
  getToken: vi.fn(),
}));

import {
  validateLogin2FAService,
  getPre2faToken,
  getToken,
} from "../../../src/Services/AuthService";

const renderPage = () =>
  render(
    <MemoryRouter>
      <TwoFactorLogin />
    </MemoryRouter>,
  );

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  getPre2faToken.mockReturnValue("pre-token-real");
  getToken.mockReturnValue(null);
});

describe("TwoFactorLogin + AuthService — flujo de validación 2FA", () => {
  it("redirige a /iniciar-sesion cuando no hay PRE_2FA en localStorage", () => {
    // Arrange
    getPre2faToken.mockReturnValue(null);
    getToken.mockReturnValue(null);

    // Act
    renderPage();

    // Assert
    expect(mockNavigate).toHaveBeenCalledWith("/iniciar-sesion", {
      replace: true,
    });
  });

  it("llama a login() con el token final y navega al dashboard cuando el código es válido", async () => {
    // Arrange
    validateLogin2FAService.mockResolvedValue({
      nextStep: "LOGIN_COMPLETE",
      token: "final-session-token",
      data: { id: 1, name: "Test User" },
    });
    renderPage();

    // Act
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByRole("button", { name: /verificar/i }));

    // Assert
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        token: "final-session-token",
        user: { id: 1, name: "Test User" },
      });
      expect(mockNavigate).toHaveBeenCalledWith("/app/dashboard", {
        replace: true,
      });
    });
  });

  it("muestra error y permanece en la página cuando el código es inválido", async () => {
    // Arrange
    const error = new Error("Código de verificación de dos pasos inválido");
    error.status = 401;
    validateLogin2FAService.mockRejectedValue(error);
    renderPage();

    // Act
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "000000" },
    });
    fireEvent.click(screen.getByRole("button", { name: /verificar/i }));

    // Assert
    await waitFor(() =>
      expect(
        screen.getByText(/Código de verificación de dos pasos inválido/i),
      ).toBeInTheDocument(),
    );
    expect(mockNavigate).not.toHaveBeenCalledWith("/app/dashboard", {
      replace: true,
    });
  });

  it("deshabilita el botón y muestra mensaje de bloqueo cuando el error es 423", async () => {
    // Arrange
    const error = new Error(
      "La autenticación en dos pasos está bloqueada temporalmente. Intenta más tarde.",
    );
    error.status = 423;
    validateLogin2FAService.mockRejectedValue(error);
    renderPage();

    // Act
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByRole("button", { name: /verificar/i }));

    // Assert
    await waitFor(() =>
      expect(screen.getByText(/bloqueada temporalmente/i)).toBeInTheDocument(),
    );
    expect(screen.getByRole("button", { name: /verificar/i })).toBeDisabled();
  });

  it("no llama al servicio cuando el código tiene menos de 6 dígitos", async () => {
    // Arrange
    renderPage();

    // Act
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /verificar/i }));

    // Assert
    await waitFor(() => expect(validateLogin2FAService).not.toHaveBeenCalled());
  });
});
