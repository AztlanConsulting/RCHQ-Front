import { z } from "zod";

export const loginSchema = z.object({
    email: z
        .string()
        .trim()
        .email("Formato de email inválido")
        .min(1, "El correo es requerido")
        .max(255, "El correo es demasiado largo"),
    password: z
        .string()
        .trim()
        .min(1, "La contraseña es requerida")
        .max(70, "La contraseña es demasiado larga"),
});