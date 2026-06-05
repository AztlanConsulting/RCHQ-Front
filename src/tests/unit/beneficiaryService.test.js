import { beforeEach, describe, expect, it, vi } from "vitest";

import { createBeneficiary } from "../../services/beneficiaryService";
import { secureFetch } from "../../utils/secureFetchWrapper";

vi.mock("../../utils/secureFetchWrapper", () => ({
    secureFetch: vi.fn(),
}));

const validBody = {
    name: "Juan",
    maternal_surname: "Lopez",
    paternal_surname: "Garcia",
    preferred_name: "Juanito",
    birth_date: "2015-03-10",
    age_entered_house: 8,
    blood_type: "O+",
    curp: null,
};

describe("beneficiaryService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("createBeneficiary", () => {
        it("envía POST a /beneficiary/add con JSON", async () => {
            secureFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    success: true,
                    redirect: "/app/beneficiarios/ver/ben-1",
                }),
            });

            const response = await createBeneficiary(validBody);

            expect(secureFetch).toHaveBeenCalledWith(
                "/beneficiary/add",
                expect.objectContaining({
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(validBody),
                }),
            );
            expect(response.redirect).toBe("/app/beneficiarios/ver/ben-1");
        });

        it("lanza error con el mensaje del backend", async () => {
            secureFetch.mockResolvedValueOnce({
                ok: false,
                json: async () => ({
                    message: "El beneficiario ya está registrado",
                }),
            });

            await expect(createBeneficiary(validBody)).rejects.toThrow(
                "El beneficiario ya está registrado",
            );
        });

        it("mapea errores de validación del backend a fieldErrors", async () => {
            secureFetch.mockResolvedValueOnce({
                ok: false,
                json: async () => ({
                    message: "Datos inválidos",
                    errors: [
                        { path: "curp", message: "CURP duplicado" },
                        { campo: "name", mensaje: "Nombre inválido" },
                    ],
                }),
            });

            await expect(createBeneficiary(validBody)).rejects.toMatchObject({
                message: "Datos inválidos",
                fieldErrors: {
                    curp: "CURP duplicado",
                    name: "Nombre inválido",
                },
            });
        });
    });
});
