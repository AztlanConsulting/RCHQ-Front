import { describe, it, expect, vi, beforeEach } from "vitest";
import {
    getPendingVacationRequests,
    getReviewedVacationRequests,
    approveVacationRequest,
    rejectVacationRequest,
} from "../../services/vacationRequestService";
import { secureFetch } from "../../utils/secureFetchWrapper";

vi.mock("../../utils/secureFetchWrapper", () => ({
    secureFetch: vi.fn(),
}));

const mockOkResponse = {
    ok: true,
    json: vi.fn().mockResolvedValue({
        success: true,
        data: [{ vacationRequestId: "vac-001" }],
        pagination: {
            page: 1,
            limit: 6,
            total: 1,
            totalPages: 1,
        },
    }),
};

describe("vacationRequestService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("getPendingVacationRequests construye query params correctamente", async () => {
        secureFetch.mockResolvedValue(mockOkResponse);

        await getPendingVacationRequests({
            page: 2,
            limit: 6,
            search: "  ana pendiente  ",
            startDate: "2026-05-01",
            endDate: "2026-05-15",
        });

        expect(secureFetch).toHaveBeenCalledWith(
            expect.stringContaining("/vacation/requests/pending?"),
            { method: "GET" },
        );

        const url = secureFetch.mock.calls[0][0];

        expect(url).toContain("page=2");
        expect(url).toContain("limit=6");
        expect(url).toContain("search=ana+pendiente");
        expect(url).toContain("startDate=2026-05-01");
        expect(url).toContain("endDate=2026-05-15");
    });

    it("getReviewedVacationRequests incluye status", async () => {
        secureFetch.mockResolvedValue(mockOkResponse);

        await getReviewedVacationRequests({
            page: 1,
            limit: 6,
            search: "ana",
            status: "approved",
        });

        const url = secureFetch.mock.calls[0][0];

        expect(url).toContain("/vacation/requests/reviewed?");
        expect(url).toContain("status=approved");
    });

    it("regresa data y pagination cuando la respuesta es exitosa", async () => {
        secureFetch.mockResolvedValue(mockOkResponse);

        const result = await getPendingVacationRequests({});

        expect(result.data).toEqual([{ vacationRequestId: "vac-001" }]);
        expect(result.pagination).toEqual({
            page: 1,
            limit: 6,
            total: 1,
            totalPages: 1,
        });
    });

    it("usa arreglo vacío si data no es arreglo", async () => {
        secureFetch.mockResolvedValue({
            ok: true,
            json: vi.fn().mockResolvedValue({
                success: true,
                data: null,
                pagination: undefined,
            }),
        });

        const result = await getPendingVacationRequests({});

        expect(result.data).toEqual([]);
        expect(result.pagination).toEqual({
            page: 1,
            limit: 6,
            total: 0,
            totalPages: 0,
        });
    });

    it("lanza error con mensaje de validación si el backend responde errores", async () => {
        secureFetch.mockResolvedValue({
            ok: false,
            json: vi.fn().mockResolvedValue({
                errors: [{ message: "La búsqueda no puede superar 100 caracteres" }],
            }),
        });

        await expect(getPendingVacationRequests({ search: "x" })).rejects.toThrow(
            "La búsqueda no puede superar 100 caracteres",
        );
    });

    it("lanza error genérico si success=false", async () => {
        secureFetch.mockResolvedValue({
            ok: true,
            json: vi.fn().mockResolvedValue({
                success: false,
            }),
        });

        await expect(getPendingVacationRequests({})).rejects.toThrow(
            "Error en la respuesta del servidor",
        );
    });

    it("approveVacationRequest llama al endpoint correcto con PATCH", async () => {
        secureFetch.mockResolvedValue({
            ok: true,
            json: vi.fn().mockResolvedValue({
                success: true,
                message: "Solicitud aprobada correctamente",
                data: {
                    vacationRequest: {
                        vacationRequestId: "vac-001",
                        status: 1,
                    },
                },
            }),
        });

        const result = await approveVacationRequest("vac-001");

        expect(secureFetch).toHaveBeenCalledWith(
            expect.stringContaining("/vacation/request/vac-001/approve"),
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({}),
            },
        );

        expect(result).toEqual({
            message: "Solicitud aprobada correctamente",
            vacationRequest: {
                vacationRequestId: "vac-001",
                status: 1,
            },
        });
    });

    it("approveVacationRequest lanza error con mensaje del backend", async () => {
        secureFetch.mockResolvedValue({
            ok: false,
            json: vi.fn().mockResolvedValue({
                message: "La solicitud ya fue revisada",
            }),
        });

        await expect(approveVacationRequest("vac-001")).rejects.toThrow(
            "La solicitud ya fue revisada",
        );
    });

    it("approveVacationRequest lanza error con mensaje de validación", async () => {
        secureFetch.mockResolvedValue({
            ok: false,
            json: vi.fn().mockResolvedValue({
                errors: [{ message: "El id de solicitud es inválido" }],
            }),
        });

        await expect(approveVacationRequest("vac-001")).rejects.toThrow(
            "El id de solicitud es inválido",
        );
    });

    it("approveVacationRequest lanza error si success=false", async () => {
        secureFetch.mockResolvedValue({
            ok: true,
            json: vi.fn().mockResolvedValue({
                success: false,
                message: "No se pudo aprobar",
            }),
        });

        await expect(approveVacationRequest("vac-001")).rejects.toThrow(
            "No se pudo aprobar",
        );
    });

    it("rejectVacationRequest llama al endpoint correcto con PATCH", async () => {
        secureFetch.mockResolvedValue({
            ok: true,
            json: vi.fn().mockResolvedValue({
                success: true,
                message: "Solicitud rechazada correctamente",
                data: {
                    vacationRequest: {
                        vacationRequestId: "vac-001",
                        status: 2,
                    },
                },
            }),
        });

        const result = await rejectVacationRequest("vac-001");

        expect(secureFetch).toHaveBeenCalledWith(
            expect.stringContaining("/vacation/request/vac-001/reject"),
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({}),
            },
        );

        expect(result).toEqual({
            message: "Solicitud rechazada correctamente",
            vacationRequest: {
                vacationRequestId: "vac-001",
                status: 2,
            },
        });
    });

    it("rejectVacationRequest lanza error con mensaje del backend", async () => {
        secureFetch.mockResolvedValue({
            ok: false,
            json: vi.fn().mockResolvedValue({
                message: "La solicitud ya fue revisada",
            }),
        });

        await expect(rejectVacationRequest("vac-001")).rejects.toThrow(
            "La solicitud ya fue revisada",
        );
    });

    it("rejectVacationRequest lanza error con mensaje de validación", async () => {
        secureFetch.mockResolvedValue({
            ok: false,
            json: vi.fn().mockResolvedValue({
                errors: [{ message: "El id de solicitud es inválido" }],
            }),
        });

        await expect(rejectVacationRequest("vac-001")).rejects.toThrow(
            "El id de solicitud es inválido",
        );
    });

    it("rejectVacationRequest lanza error si success=false", async () => {
        secureFetch.mockResolvedValue({
            ok: true,
            json: vi.fn().mockResolvedValue({
                success: false,
                message: "No se pudo rechazar",
            }),
        });

        await expect(rejectVacationRequest("vac-001")).rejects.toThrow(
            "No se pudo rechazar",
        );
    });
});
