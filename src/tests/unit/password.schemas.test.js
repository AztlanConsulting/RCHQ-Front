import { describe, it, expect } from "vitest";
import {
    selfServiceChangePasswordSchema,
    firstLoginChangePasswordSchema,
    PASSWORD_POLICY_MESSAGE,
} from "../../schemas/password.schemas";

describe("password.schemas — selfServiceChangePasswordSchema", () => {
    it("falla cuando la contraseña actual está vacía", () => {
        const result = selfServiceChangePasswordSchema.safeParse({
            currentPassword: "",
            newPassword: "NuevaPass123",
            confirmPassword: "NuevaPass123",
        });

        expect(result.success).toBe(false);
        expect(result.error.issues[0].message).toBe("La contraseña actual es requerida");
    });

    it("falla cuando la nueva contraseña no cumple la política", () => {
        const result = selfServiceChangePasswordSchema.safeParse({
            currentPassword: "Actual123",
            newPassword: "abc",
            confirmPassword: "abc",
        });

        expect(result.success).toBe(false);
        expect(result.error.issues[0].message).toBe(PASSWORD_POLICY_MESSAGE);
    });

    it("falla cuando la confirmación no coincide", () => {
        const result = selfServiceChangePasswordSchema.safeParse({
            currentPassword: "Actual123",
            newPassword: "NuevaPass123",
            confirmPassword: "OtraPass123",
        });

        expect(result.success).toBe(false);
        expect(
            result.error.issues.some(
                (issue) => issue.message === "Las contraseñas no coinciden",
            ),
        ).toBe(true);
    });

    it("pasa con datos válidos", () => {
        const result = selfServiceChangePasswordSchema.safeParse({
            currentPassword: "Actual123",
            newPassword: "NuevaPass123",
            confirmPassword: "NuevaPass123",
        });

        expect(result.success).toBe(true);
    });
});

describe("password.schemas — firstLoginChangePasswordSchema", () => {
    it("falla cuando la nueva contraseña no cumple política", () => {
        const result = firstLoginChangePasswordSchema.safeParse({
            newPassword: "123",
            confirmPassword: "123",
        });

        expect(result.success).toBe(false);
        expect(result.error.issues[0].message).toBe(PASSWORD_POLICY_MESSAGE);
    });

    it("falla cuando la confirmación no coincide", () => {
        const result = firstLoginChangePasswordSchema.safeParse({
            newPassword: "NuevaPass123",
            confirmPassword: "OtraPass123",
        });

        expect(result.success).toBe(false);
        expect(
            result.error.issues.some(
                (issue) => issue.message === "Las contraseñas no coinciden",
            ),
        ).toBe(true);
    });

    it("pasa con datos válidos", () => {
        const result = firstLoginChangePasswordSchema.safeParse({
            newPassword: "NuevaPass123",
            confirmPassword: "NuevaPass123",
        });

        expect(result.success).toBe(true);
    });
});