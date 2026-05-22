import { describe, it, expect } from "vitest";
import AuthUtils from "../../utils/auth.utils";

describe("AuthUtils.getRoleName", () => {
    it("obtiene el rol desde role.name", () => {
        expect(AuthUtils.getRoleName({ role: { name: "Coordinador" } })).toBe(
            "coordinador",
        );
    });

    it("obtiene el rol desde roleName", () => {
        expect(AuthUtils.getRoleName({ roleName: "Administrador" })).toBe(
            "administrador",
        );
    });

    it("obtiene el rol desde role como string", () => {
        expect(AuthUtils.getRoleName({ role: "Coordinador" })).toBe(
            "coordinador",
        );
    });

    it("regresa string vacío si no hay rol", () => {
        expect(AuthUtils.getRoleName({})).toBe("");
        expect(AuthUtils.getRoleName(null)).toBe("");
    });
});

describe("AuthUtils.hasRole", () => {
    it("compara roles sin importar mayúsculas/minúsculas", () => {
        expect(
            AuthUtils.hasRole({ role: { name: "Coordinador" } }, "coordinador"),
        ).toBe(true);
        expect(
            AuthUtils.hasRole(
                { role: { name: "Administrador" } },
                "Coordinador",
            ),
        ).toBe(false);
    });
});
