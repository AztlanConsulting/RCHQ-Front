import { z } from "zod";

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 64;

export const PASSWORD_POLICY_MESSAGE =
    "La nueva contraseña no cumple con los requisitos indicados.";

const requiredPasswordSchema = z
    .string()
    .trim()
    .min(1, "La contraseña actual es requerida")
    .max(
        PASSWORD_MAX_LENGTH,
        `La contraseña actual debe tener como máximo ${PASSWORD_MAX_LENGTH} caracteres`,
    );

const passwordPolicySchema = z
    .string()
    .min(1, "La nueva contraseña es requerida")
    .max(
        PASSWORD_MAX_LENGTH,
        `La contraseña debe tener como máximo ${PASSWORD_MAX_LENGTH} caracteres`,
    )
    .refine((value) => value.length >= PASSWORD_MIN_LENGTH, {
        message: PASSWORD_POLICY_MESSAGE,
    })
    .refine((value) => /[a-z]/.test(value), {
        message: PASSWORD_POLICY_MESSAGE,
    })
    .refine((value) => /[A-Z]/.test(value), {
        message: PASSWORD_POLICY_MESSAGE,
    })
    .refine((value) => /[0-9]/.test(value), {
        message: PASSWORD_POLICY_MESSAGE,
    });

const confirmPasswordSchema = z
    .string()
    .min(1, "La confirmación de contraseña es requerida");

export const selfServiceChangePasswordSchema = z
    .object({
        currentPassword: requiredPasswordSchema,
        newPassword: passwordPolicySchema,
        confirmPassword: confirmPasswordSchema,
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        path: ["confirmPassword"],
        message: "Las contraseñas no coinciden",
    });

export const firstLoginChangePasswordSchema = z
    .object({
        newPassword: passwordPolicySchema,
        confirmPassword: confirmPasswordSchema,
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        path: ["confirmPassword"],
        message: "Las contraseñas no coinciden",
    });

export const getFirstSchemaError = (result) =>
    result?.success ? null : result?.error?.issues?.[0]?.message || null;