import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Perfil from "../../pages/Perfil";

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock("../../services/profileService", () => ({
  getUserData:      vi.fn(),
  getReadableErrors: vi.fn((err) => {
    if (Array.isArray(err?.errors) && err.errors.length > 0)
      return err.errors.map((e) => e.message);
    if (err?.message) return [err.message];
    return ["Ocurrió un error inesperado"];
  }),
}));

vi.mock("../../utils/authStorage", () => ({
  getToken: vi.fn(() => "fake-token"),
}));

import { getUserData } from "../../services/profileService";

// ─── Datos de prueba ──────────────────────────────────────────────────────────

const mockUserRaw = {
  picture:     null,
  houseName:   "Ammi",
  roleName:    "Cuidador",
  name:        "Manuel",
  surname:     "Bajos Rivera",
  email:       "mbajosr@gmail.com",
  rfc:         "LOQE050810245",
  curp:        "LOQE050810HQRNNS09",
  nss:         "98766543210",
  bankAccount: "123456789012345678",
  birthDate:   "2004-07-09T00:00:00.000Z",
};

const renderPage = () =>
  render(
    <MemoryRouter>
      <Perfil />
    </MemoryRouter>,
  );

// ─── Setup / Teardown ─────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ─── Suite ────────────────────────────────────────────────────────────────────

describe("Consultar Perfil — integración", () => {

  // ── Carga ──────────────────────────────────────────────────────────────────

  it("muestra el skeleton mientras carga y luego lo oculta", async () => {
    // Arrange: la promesa nunca resuelve durante el assert del skeleton
    let resolve;
    getUserData.mockReturnValue(new Promise((res) => { resolve = res; }));

    // Act
    renderPage();

    // Assert: skeleton visible
    expect(document.querySelector(".animate-pulse")).toBeInTheDocument();

    // Resolve para no dejar la promesa colgada
    resolve({ data: mockUserRaw });
    await waitFor(() =>
      expect(document.querySelector(".animate-pulse")).not.toBeInTheDocument(),
    );
  });

  // ── Status 200 ─────────────────────────────────────────────────────────────

  it("200 — muestra la información del perfil del usuario", async () => {
    // Arrange
    getUserData.mockResolvedValue({ data: mockUserRaw });

    // Act
    renderPage();

    // Assert
    await waitFor(() => {
      expect(screen.getByText("Datos del Usuario")).toBeInTheDocument();
    });

    expect(screen.getByText("Manuel")).toBeInTheDocument();
    expect(screen.getByText("Bajos Rivera")).toBeInTheDocument();
    expect(screen.getByText("mbajosr@gmail.com")).toBeInTheDocument();
    expect(screen.getByText("LOQE050810245")).toBeInTheDocument();
    expect(screen.getByText("LOQE050810HQRNNS09")).toBeInTheDocument();
    expect(screen.getByText("98766543210")).toBeInTheDocument();
    expect(screen.getByText("Ammi")).toBeInTheDocument();
    expect(screen.getByText("Cuidador")).toBeInTheDocument();

    // Botones de acción visibles
    expect(screen.getByRole("button", { name: /modificar perfil/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /otras opciones/i })).toBeInTheDocument();

    // La app no crashea
    expect(document.querySelector(".animate-pulse")).not.toBeInTheDocument();
  });

  it("200 — la llamada a la API recibe el token correcto", async () => {
    // Arrange
    getUserData.mockResolvedValue({ data: mockUserRaw });

    // Act
    renderPage();
    await waitFor(() =>
      expect(screen.getByText("Datos del Usuario")).toBeInTheDocument(),
    );

    // Assert
    expect(getUserData).toHaveBeenCalledTimes(1);
    expect(getUserData).toHaveBeenCalledWith("fake-token");
  });

  // ── Status 401 ─────────────────────────────────────────────────────────────

  it("401 — muestra error de permisos sin botón de reintentar", async () => {
    // Arrange
    const err = new Error("No tienes permisos para ver esta información.");
    err.status = 401;
    getUserData.mockRejectedValue(err);

    // Act
    renderPage();

    // Assert
    await waitFor(() => {
      expect(screen.getByText("Sin permisos")).toBeInTheDocument();
    });
    expect(
      screen.getByText(/no tienes permisos para ver esta información/i),
    ).toBeInTheDocument();

    // Sin botón de reintentar en 401
    expect(screen.queryByRole("button", { name: /reintentar/i })).not.toBeInTheDocument();
  });

  // ── Status 404 ─────────────────────────────────────────────────────────────

  it("404 — muestra error de ruta no encontrada con botón de reintentar", async () => {
    // Arrange
    const err = new Error("Ruta no encontrada.");
    err.status = 404;
    getUserData.mockRejectedValue(err);

    // Act
    renderPage();

    // Assert
    await waitFor(() => {
      expect(screen.getByText("Ruta no encontrada")).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: /reintentar/i })).toBeInTheDocument();
  });

  // ── Status 501 ─────────────────────────────────────────────────────────────

  it("501 — muestra error del servidor con botón de reintentar", async () => {
    // Arrange
    const err = new Error("Ocurrió un problema al obtener la información.");
    err.status = 501;
    getUserData.mockRejectedValue(err);

    // Act
    renderPage();

    // Assert
    await waitFor(() => {
      expect(screen.getByText("Error del servidor")).toBeInTheDocument();
    });
    expect(
      screen.getByText(/ocurrió un problema al obtener la información/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /reintentar/i })).toBeInTheDocument();
  });

  // ── Reintentar ─────────────────────────────────────────────────────────────

  it("reintentar — vuelve a llamar a la API y muestra el perfil al resolverse", async () => {
    // Arrange: primer intento falla, segundo exitoso
    const err = new Error("Ruta no encontrada.");
    err.status = 404;
    getUserData
      .mockRejectedValueOnce(err)
      .mockResolvedValueOnce({ data: mockUserRaw });

    // Act
    renderPage();

    await waitFor(() => {
      expect(screen.getByText("Ruta no encontrada")).toBeInTheDocument();
    });

    const retryBtn = screen.getByRole("button", { name: /reintentar/i });
    retryBtn.click();

    // Assert
    await waitFor(() => {
      expect(screen.getByText("Datos del Usuario")).toBeInTheDocument();
    });
    expect(getUserData).toHaveBeenCalledTimes(2);
  });

});