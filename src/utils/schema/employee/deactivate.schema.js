import { z } from "zod";

export const deactivateEmployeeSchema = z.object({
  reason: z
    .string()
    .max(250, 'El campo "Razón" es de máximo 250 caracteres.')
    .regex(/^[^<>]*$/, 'El campo "Razón" contiene caracteres no permitidos.')
    .optional(),
  addToBlacklist: z.boolean().optional(),
});