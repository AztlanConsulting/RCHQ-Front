import { describe, expect, it } from "vitest";

import {
    getAllowedContractTypesForRole,
    getRequiredContractTypeForRole,
    isContractTypeAllowedForRole,
    resolveContractTypeForRole,
} from "../../utils/roleContractRules";

describe("roleContractRules", () => {
    it("exige Proveedor para el puesto Proveedor", () => {
        expect(getRequiredContractTypeForRole("Proveedor")).toBe("Proveedor");
        expect(isContractTypeAllowedForRole("Proveedor", "Proveedor")).toBe(true);
        expect(isContractTypeAllowedForRole("Proveedor", "Nomina")).toBe(false);
    });

    it("exige Patronato para puestos de patronato", () => {
        ["Presidente", "Vicepresidente", "Tesorero", "Vocal"].forEach((roleName) => {
            expect(getRequiredContractTypeForRole(roleName)).toBe("Patronato");
            expect(isContractTypeAllowedForRole(roleName, "Patronato")).toBe(true);
            expect(isContractTypeAllowedForRole(roleName, "Nomina")).toBe(false);
        });
    });

    it("limita las opciones de contrato cuando el puesto tiene regla", () => {
        expect(getAllowedContractTypesForRole("Presidente")).toEqual([
            { value: "Patronato", label: "Patronato" },
        ]);
        expect(getAllowedContractTypesForRole("Proveedor")).toEqual([
            { value: "Proveedor", label: "Proveedor" },
        ]);
    });

    it("resuelve el contrato forzado al cambiar puesto", () => {
        expect(resolveContractTypeForRole("Presidente", "Nomina")).toBe("Patronato");
        expect(resolveContractTypeForRole("Proveedor", "Patronato")).toBe("Proveedor");
        expect(resolveContractTypeForRole("Mantenimiento", "Honorarios")).toBe("Honorarios");
    });
});
