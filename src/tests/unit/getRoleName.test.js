import { describe, it, expect } from "vitest";
import { getRoleName, hasRole } from "../../utils/auth/getRoleName";

describe("getRoleName", () => {
    it("obtiene el rol desde role.name", () => {
        expect(getRoleName({ role: { name: "Coordinador" } })).toBe("coordinador");
    });

    it("obtiene el rol desde roleName", () => {
        expect(getRoleName({ roleName: "Admin" })).toBe("admin");
    });

    it("obtiene el rol desde role como string", () => {
        expect(getRoleName({ role: "Coordinador" })).toBe("coordinador");
    });

    it("regresa string vacío si no hay rol", () => {
        expect(getRoleName({})).toBe("");
        expect(getRoleName(null)).toBe("");
    });
});

describe("hasRole", () => {
    it("compara roles sin importar mayúsculas/minúsculas", () => {
        expect(hasRole({ role: { name: "Coordinador" } }, "coordinador")).toBe(true);
        expect(hasRole({ role: { name: "Admin" } }, "Coordinador")).toBe(false);
    });
});
