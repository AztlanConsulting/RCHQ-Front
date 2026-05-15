import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Perfil from "../../pages/perfil";

vi.mock("../../services/profileService", () => ({
    getUserData: vi.fn(),
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

const mockUserRaw = {
    picture: null,
    houseName: "Ammi",
    roleName: "Cuidador",
    name: "Manuel",
    surname: "Bajos Rivera",
    email: "mbajosr@gmail.com",
    rfc: "LOQE050810245",
    curp: "LOQE050810HQRNNS09",
    nss: "98766543210",
    bankAccount: "123456789012345678",
    birthDate: "2004-07-09T00:00:00.000Z",
};

const renderPage = () =>
    render(
        <MemoryRouter>
            <Perfil />
        </MemoryRouter>,
    );

beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
    vi.restoreAllMocks();
});

describe("Consultar Perfil — integración", () => {
    it("muestra el skeleton mientras carga y luego lo oculta", async () => {
        let resolve;
        getUserData.mockReturnValue(
            new Promise((res) => {
                resolve = res;
            }),
        );

        renderPage();

        expect(document.querySelector(".animate-pulse")).toBeInTheDocument();

        resolve({ data: mockUserRaw });
        await waitFor(() =>
            expect(
                document.querySelector(".animate-pulse"),
            ).not.toBeInTheDocument(),
        );
    });

    it("200 — muestra la información del perfil del usuario", async () => {
        getUserData.mockResolvedValue({ data: mockUserRaw });

        renderPage();

        await waitFor(() => {
            expect(
                screen.getAllByText("Datos del Usuario").length,
            ).toBeGreaterThan(0);
        });

        expect(screen.getAllByText("Manuel").length).toBeGreaterThan(0);
        expect(screen.getAllByText("Bajos Rivera").length).toBeGreaterThan(0);
        expect(screen.getAllByText("mbajosr@gmail.com").length).toBeGreaterThan(
            0,
        );
        expect(screen.getAllByText("LOQE050810245").length).toBeGreaterThan(0);
        expect(
            screen.getAllByText("LOQE050810HQRNNS09").length,
        ).toBeGreaterThan(0);
        expect(screen.getAllByText("98766543210").length).toBeGreaterThan(0);
        expect(screen.getAllByText("Ammi").length).toBeGreaterThan(0);
        expect(screen.getAllByText("Cuidador").length).toBeGreaterThan(0);

        expect(
            screen.getByRole("button", { name: /modificar perfil/i }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: /otras opciones/i }),
        ).toBeInTheDocument();

        expect(
            document.querySelector(".animate-pulse"),
        ).not.toBeInTheDocument();
    });

    it("200 — la llamada a la API recibe el token correcto", async () => {
        getUserData.mockResolvedValue({ data: mockUserRaw });

        renderPage();
        await waitFor(() =>
            expect(
                screen.getAllByText("Datos del Usuario").length,
            ).toBeGreaterThan(0),
        );

        expect(getUserData).toHaveBeenCalledTimes(1);
        expect(getUserData).toHaveBeenCalledWith("fake-token");
    });

    it("401 — muestra error de permisos sin botón de reintentar", async () => {
        const err = new Error("No tienes permisos para ver esta información.");
        err.status = 401;
        getUserData.mockRejectedValue(err);

        renderPage();

        await waitFor(() => {
            expect(screen.getByText("Sin permisos")).toBeInTheDocument();
        });
        expect(
            screen.getByText(/no tienes permisos para ver esta información/i),
        ).toBeInTheDocument();
        expect(
            screen.queryByRole("button", { name: /reintentar/i }),
        ).not.toBeInTheDocument();
    });

    it("404 — muestra error de ruta no encontrada con botón de reintentar", async () => {
        const err = new Error("Ruta no encontrada.");
        err.status = 404;
        getUserData.mockRejectedValue(err);

        renderPage();

        await waitFor(() => {
            expect(screen.getByText("Ruta no encontrada")).toBeInTheDocument();
        });
        expect(
            screen.getByRole("button", { name: /reintentar/i }),
        ).toBeInTheDocument();
    });

    it("501 — muestra error del servidor con botón de reintentar", async () => {
        const err = new Error("Ocurrió un problema al obtener la información.");
        err.status = 501;
        getUserData.mockRejectedValue(err);

        renderPage();

        await waitFor(() => {
            expect(screen.getByText("Error del servidor")).toBeInTheDocument();
        });
        expect(
            screen.getByText(/ocurrió un problema al obtener la información/i),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: /reintentar/i }),
        ).toBeInTheDocument();
    });

    it("reintentar — vuelve a llamar a la API y muestra el perfil al resolverse", async () => {
        const err = new Error("Ruta no encontrada.");
        err.status = 404;
        getUserData
            .mockRejectedValueOnce(err)
            .mockResolvedValueOnce({ data: mockUserRaw });

        renderPage();

        await waitFor(() => {
            expect(screen.getByText("Ruta no encontrada")).toBeInTheDocument();
        });

        const retryBtn = screen.getByRole("button", { name: /reintentar/i });
        retryBtn.click();

        await waitFor(() => {
            expect(
                screen.getAllByText("Datos del Usuario").length,
            ).toBeGreaterThan(0);
        });
        expect(getUserData).toHaveBeenCalledTimes(2);
    });
});
