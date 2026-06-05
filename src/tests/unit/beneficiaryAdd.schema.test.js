import { describe, expect, it } from "vitest";

import { beneficiaryCreateSchema } from "../../utils/schema/beneficiary/beneficiaryAdd.schema";

const validPayload = {
    name: "Juan Manuel",
    maternal_surname: "Lopez",
    paternal_surname: "Garcia",
    preferred_name: "Juanito",
    birth_date: "2015-03-10",
    age_entered_house: 8,
    blood_type: "O+",
    curp: "",
};

describe("beneficiaryCreateSchema", () => {
    it("acepta un payload válido sin CURP", () => {
        const result = beneficiaryCreateSchema.safeParse(validPayload);

        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.curp).toBeNull();
        }
    });

    it("normaliza el CURP a mayúsculas cuando es válido", () => {
        const result = beneficiaryCreateSchema.safeParse({
            ...validPayload,
            curp: "galj150310hdfrzn09",
        });

        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.curp).toBe("GALJ150310HDFRZN09");
        }
    });

    it("rechaza nombres vacíos", () => {
        const result = beneficiaryCreateSchema.safeParse({
            ...validPayload,
            name: "",
        });

        expect(result.success).toBe(false);
        if (!result.success) {
            expect(
                result.error.issues.some((i) => i.path[0] === "name"),
            ).toBe(true);
        }
    });

    it("rechaza caracteres especiales en el nombre", () => {
        const result = beneficiaryCreateSchema.safeParse({
            ...validPayload,
            name: "Juan@",
        });

        expect(result.success).toBe(false);
    });

    it("rechaza fechas de nacimiento futuras", () => {
        const result = beneficiaryCreateSchema.safeParse({
            ...validPayload,
            birth_date: "2099-01-01",
        });

        expect(result.success).toBe(false);
        if (!result.success) {
            expect(
                result.error.issues.some((i) =>
                    String(i.message).includes("futura"),
                ),
            ).toBe(true);
        }
    });

    it("rechaza un CURP con formato inválido", () => {
        const result = beneficiaryCreateSchema.safeParse({
            ...validPayload,
            curp: "CURP-INVALIDA",
        });

        expect(result.success).toBe(false);
        if (!result.success) {
            expect(
                result.error.issues.some((i) => i.path[0] === "curp"),
            ).toBe(true);
        }
    });

    it("rechaza edad al entrar mayor que la edad actual del niño", () => {
        const result = beneficiaryCreateSchema.safeParse({
            ...validPayload,
            birth_date: "2020-01-01",
            age_entered_house: 15,
        });

        expect(result.success).toBe(false);
        if (!result.success) {
            const ageIssue = result.error.issues.find(
                (i) => i.path[0] === "age_entered_house",
            );
            expect(ageIssue?.message).toMatch(
                /no puede ser mayor que la edad actual/i,
            );
        }
    });

    it("rechaza un tipo de sangre inválido", () => {
        const result = beneficiaryCreateSchema.safeParse({
            ...validPayload,
            blood_type: "X+",
        });

        expect(result.success).toBe(false);
    });
});
