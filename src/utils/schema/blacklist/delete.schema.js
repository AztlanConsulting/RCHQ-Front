import { z } from "zod";

export const REASON_REGEX = /^[a-zA-Z0-9\s.,!?áéíóúÁÉÍÓÚñÑ-]*$/;
export const INVALID_REASON_CHARS_REGEX = /[^a-zA-Z0-9\s.,!?áéíóúÁÉÍÓÚñÑ-]/g;

export const blacklistDeleteSchema = z.object({
  curp: z
    .string()
    .regex(
      /^[A-Z]{4}\d{6}[HM][A-Z]{5}\w\d$/,
      'El campo "CURP" tiene un formato inválido.'
    ),
  reason: z
    .string()
    .min(1, 'El campo "Razón" es obligatorio.')
    .max(250, 'El campo "Razón" es de máximo 250 caracteres.')
    .regex(REASON_REGEX, 'El campo "Razón" solo admite letras, números y signos básicos.'),
});