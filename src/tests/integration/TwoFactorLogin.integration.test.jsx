import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import TwoFactorLogin from "../../Pages/Auth/TwoFactorLogin";
import {
  validateLoginTwoFactorAuthService,
  getToken,
} from "../../Services/AuthService";

const mockNavigate = vi.fn();
const mockLogin = vi.fn();

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("../../context/AuthContext", () => ({
  useAuthContext: () => ({ login: mockLogin }),
}));

vi.mock("../../Services/AuthService", () => ({
  validateLoginTwoFactorAuthService: vi.fn(),
  getToken: vi.fn(),
}));

const renderPage = () =>
  render(
    <MemoryRouter>
      <TwoFactorLogin />
    </MemoryRouter>,
  );

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  getToken.mockReturnValue(null);
});

describe("TwoFactorLogin + AuthService — flujo de validación TwoFactorAuth", () => {
  it("redirige al dashboard cuando ya hay sessionToken en localStorage", () => {
    getToken.mockReturnValue("existing-session-token");
    renderPage();
    expect(mockNavigate).toHaveBeenCalledWith("/app/dashboard", {
      replace: true,
    });
  });

  it("llama a login() con el token final y navega al dashboard cuando el código es válido", async () => {
    validateLoginTwoFactorAuthService.mockResolvedValue({
      nextStep: "LOGIN_COMPLETE",
      token: "final-session-token",
      data: { id: 1, name: "Test User" },
    });
    renderPage();

    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByRole("button", { name: /verificar/i }));

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
    const error = new Error("Código de autenticación en dos pasos inválido");
    error.status = 401;
    validateLoginTwoFactorAuthService.mockRejectedValue(error);
    renderPage();

    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "000000" },
    });
    fireEvent.click(screen.getByRole("button", { name: /verificar/i }));

    await waitFor(() =>
      expect(
        screen.getByText(/código de autenticación en dos pasos inválido/i),
      ).toBeInTheDocument(),
    );
    expect(mockNavigate).not.toHaveBeenCalledWith("/app/dashboard", {
      replace: true,
    });
  });

  it("deshabilita el botón y muestra mensaje de bloqueo cuando el error es 423", async () => {
    const error = new Error(
      "La autenticación en dos pasos está bloqueada temporalmente. Intenta más tarde.",
    );
    error.status = 423;
    validateLoginTwoFactorAuthService.mockRejectedValue(error);
    renderPage();

    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByRole("button", { name: /verificar/i }));

    await waitFor(() =>
      expect(screen.getByText(/bloqueada temporalmente/i)).toBeInTheDocument(),
    );
    expect(screen.getByRole("button", { name: /verificar/i })).toBeDisabled();
  });

  it("no llama al servicio cuando el código tiene menos de 6 dígitos", async () => {
    renderPage();

    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /verificar/i }));

    await waitFor(() =>
      expect(validateLoginTwoFactorAuthService).not.toHaveBeenCalled(),
    );
  });
});
