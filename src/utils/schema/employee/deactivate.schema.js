import { z } from "zod";

export const REASON_REGEX = /^[a-zA-Z0-9\s.,!?áéíóúÁÉÍÓÚñÑ-]*$/;

export const deactivateEmployeeSchema = z.object({
  reason: z
    .string()
    .max(250, 'El campo "Razón" es de máximo 250 caracteres.')
    .regex(REASON_REGEX, 'El campo "Razón" solo admite letras, números y signos básicos.')
    .optional(),
  addToBlacklist: z.boolean().optional(),
});