import { z } from "zod";

export const deactivateEmployeeSchema = z.object({
  reason: z
    .string()
    .min(1, 'El campo "Razón" no debe estar vacío.')
    .max(250, 'El campo "Razón" es de máximo 250 caracteres.'),
});