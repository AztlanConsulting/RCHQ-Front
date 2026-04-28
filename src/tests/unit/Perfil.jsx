// tests/frontend/Perfil.test.jsx
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import Perfil from "../../src/Pages/Perfil";

// ─── Mocks ───────────────────────────────────────────────────────────────────
jest.mock("../../src/Services/ProfileService", () => ({
  getUserData:      jest.fn(),
  getReadableErrors: jest.fn((err) => [err?.message ?? "Error inesperado"]),
}));

jest.mock("../../src/utils/authStorage", () => ({
  getToken: jest.fn().mockReturnValue("mock-token"),
}));

import { getUserData } from "../../src/Services/ProfileService";

// ─── Fixtures ────────────────────────────────────────────────────────────────
const PROFILE_DATA = {
  data: {
    houseName:   "Casa Hogar Querétaro",
    roleName:    "Coordinador",
    name:        "Juan",
    surname:     "Pérez",
    email:       "juan@casa.org",
    rfc:         "PERJ900101ABC",
    curp:        "PERJ900101HDFRZN01",
    nss:         "12345678901",
    bankAccount: "012345678901234567",
    birthDate:   "1990-01-01T00:00:00.000Z",
    picture:     "",
  },
};

// ─── Tests ───────────────────────────────────────────────────────────────────
describe("Perfil.jsx", () => {
  beforeEach(() => jest.clearAllMocks());

  // ── Loading ────────────────────────────────────────────────────────────────
  describe("Estado de carga", () => {
    it("muestra el skeleton mientras carga", () => {
      // Promesa que nunca resuelve para mantener loading=true
      getUserData.mockReturnValue(new Promise(() => {}));

      const { container } = render(<Perfil />);

      expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
    });

    it("no muestra ProfileCard mientras carga", () => {
      getUserData.mockReturnValue(new Promise(() => {}));

      render(<Perfil />);

      expect(screen.queryByText("Datos del Usuario")).not.toBeInTheDocument();
    });
  });

  // ── Flujo exitoso ──────────────────────────────────────────────────────────
  describe("Flujo exitoso", () => {
    it("muestra el título 'Mi Perfil'", async () => {
      getUserData.mockResolvedValue(PROFILE_DATA);

      render(<Perfil />);

      expect(screen.getByText("Mi Perfil")).toBeInTheDocument();
    });

    it("renderiza ProfileCard con los datos del usuario", async () => {
      getUserData.mockResolvedValue(PROFILE_DATA);

      render(<Perfil />);

      await waitFor(() => {
        expect(screen.getByText("Datos del Usuario")).toBeInTheDocument();
      });
    });

    it("muestra el nombre del empleado en la card", async () => {
      getUserData.mockResolvedValue(PROFILE_DATA);

      render(<Perfil />);

      await waitFor(() => {
        expect(screen.getByText("Juan")).toBeInTheDocument();
      });
    });

    it("muestra la casa hogar correctamente", async () => {
      getUserData.mockResolvedValue(PROFILE_DATA);

      render(<Perfil />);

      await waitFor(() => {
        expect(screen.getByText("Casa Hogar Querétaro")).toBeInTheDocument();
      });
    });

    it("formatea el birthDate a locale es-MX", async () => {
      getUserData.mockResolvedValue(PROFILE_DATA);

      render(<Perfil />);

      await waitFor(() => {
        // "1990-01-01" → "01/01/1990" en es-MX
        expect(screen.getByText("01/01/1990")).toBeInTheDocument();
      });
    });

    it("oculta el skeleton tras cargar exitosamente", async () => {
      getUserData.mockResolvedValue(PROFILE_DATA);

      const { container } = render(<Perfil />);

      await waitFor(() => {
        expect(container.querySelector(".animate-pulse")).not.toBeInTheDocument();
      });
    });

    it("no muestra bloque de error cuando la carga es exitosa", async () => {
      getUserData.mockResolvedValue(PROFILE_DATA);

      render(<Perfil />);

      await waitFor(() => {
        expect(screen.queryByText("Sin permisos")).not.toBeInTheDocument();
        expect(screen.queryByText("Reintentar")).not.toBeInTheDocument();
      });
    });
  });

  // ── Error 401 ─────────────────────────────────────────────────────────────
  describe("Error 401 — Sin permisos", () => {
    it("muestra el título de error correcto", async () => {
      const err = Object.assign(new Error("No autorizado"), { status: 401 });
      getUserData.mockRejectedValue(err);

      render(<Perfil />);

      await waitFor(() => {
        expect(screen.getByText("Sin permisos")).toBeInTheDocument();
      });
    });

    it("NO muestra botón de reintentar en error 401", async () => {
      const err = Object.assign(new Error("No autorizado"), { status: 401 });
      getUserData.mockRejectedValue(err);

      render(<Perfil />);

      await waitFor(() => {
        expect(screen.queryByText("Reintentar")).not.toBeInTheDocument();
      });
    });
  });

  // ── Error 404 ─────────────────────────────────────────────────────────────
  describe("Error 404 — Ruta no encontrada", () => {
    it("muestra el título 'Ruta no encontrada'", async () => {
      const err = Object.assign(new Error("Not found"), { status: 404 });
      getUserData.mockRejectedValue(err);

      render(<Perfil />);

      await waitFor(() => {
        expect(screen.getByText("Ruta no encontrada")).toBeInTheDocument();
      });
    });

    it("muestra botón de reintentar en error 404", async () => {
      const err = Object.assign(new Error("Not found"), { status: 404 });
      getUserData.mockRejectedValue(err);

      render(<Perfil />);

      await waitFor(() => {
        expect(screen.getByText("Reintentar")).toBeInTheDocument();
      });
    });
  });

  // ── Error 501 ─────────────────────────────────────────────────────────────
  describe("Error 501 — Error del servidor", () => {
    it("muestra el título 'Error del servidor'", async () => {
      const err = Object.assign(new Error("Server error"), { status: 501 });
      getUserData.mockRejectedValue(err);

      render(<Perfil />);

      await waitFor(() => {
        expect(screen.getByText("Error del servidor")).toBeInTheDocument();
      });
    });

    it("muestra botón de reintentar en error 501", async () => {
      const err = Object.assign(new Error("Server error"), { status: 501 });
      getUserData.mockRejectedValue(err);

      render(<Perfil />);

      await waitFor(() => {
        expect(screen.getByText("Reintentar")).toBeInTheDocument();
      });
    });
  });

  // ── Error genérico ────────────────────────────────────────────────────────
  describe("Error inesperado — status desconocido", () => {
    it("muestra 'Error inesperado' para status no mapeado", async () => {
      const err = Object.assign(new Error("Algo raro"), { status: 999 });
      getUserData.mockRejectedValue(err);

      render(<Perfil />);

      await waitFor(() => {
        expect(screen.getByText("Error inesperado")).toBeInTheDocument();
      });
    });
  });

  // ── Botón reintentar ──────────────────────────────────────────────────────
  describe("Funcionalidad de reintento", () => {
    it("llama a getUserData de nuevo al hacer clic en Reintentar", async () => {
      const err = Object.assign(new Error("Server error"), { status: 501 });
      getUserData
        .mockRejectedValueOnce(err)
        .mockResolvedValueOnce(PROFILE_DATA);

      render(<Perfil />);

      await waitFor(() => screen.getByText("Reintentar"));

      fireEvent.click(screen.getByText("Reintentar"));

      await waitFor(() => {
        expect(getUserData).toHaveBeenCalledTimes(2);
      });
    });

    it("muestra ProfileCard después de reintentar con éxito", async () => {
      const err = Object.assign(new Error("Server error"), { status: 501 });
      getUserData
        .mockRejectedValueOnce(err)
        .mockResolvedValueOnce(PROFILE_DATA);

      render(<Perfil />);

      await waitFor(() => screen.getByText("Reintentar"));
      fireEvent.click(screen.getByText("Reintentar"));

      await waitFor(() => {
        expect(screen.getByText("Datos del Usuario")).toBeInTheDocument();
      });
    });
  });
});