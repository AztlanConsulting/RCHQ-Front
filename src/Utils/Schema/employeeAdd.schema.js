import { z } from "zod";

const CURP_REGEX = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/;
const RFC_REGEX = /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/;
const ONLY_NUMBERS_REGEX = /^\d+$/;
const NAMES_REGEX = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;

export const employeeCreateSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "El nombre es obligatorio")
        .max(50, "El nombre es demasiado largo")
        .regex(
            NAMES_REGEX,
            "No se permiten caracteres especiales en el nombre",
        ),
    surname: z
        .string()
        .trim()
        .min(2, "El apellido es obligatorio")
        .max(50, "El apellido es demasiado largo")
        .regex(
            NAMES_REGEX,
            "No se permiten caracteres especiales en el apellido",
        ),
    email: z
        .string()
        .trim()
        .email("Formato de correo inválido")
        .max(60, "El correo es demasiado largo"),
    curp: z
        .string()
        .trim()
        .length(18, "El CURP debe tener exactamente 18 dígitos")
        .toUpperCase()
        .regex(CURP_REGEX, "Formato del CURP inválido"),
    role_id: z.string().uuid("Selecciona un puesto"),
    rfc: z
        .string()
        .trim()
        .toUpperCase()
        .length(13, "El RFC debe tener exactamente 13 dígitos")
        .regex(RFC_REGEX, "Formato del RFC inválido")
        .or(z.literal(""))
        .nullable()
        .optional(),
    nss: z
        .string()
        .trim()
        .length(11, "El NSS debe tener exactamente 11 dígitos")
        .regex(ONLY_NUMBERS_REGEX, "El NSS solo debe contener números")
        .or(z.literal(""))
        .nullable()
        .optional(),
    clabe: z
        .string()
        .trim()
        .length(18, "La CLABE debe tener exactamente 18 dígitos")
        .regex(ONLY_NUMBERS_REGEX, "La cuenta CLABE solo debe contener números")
        .or(z.literal(""))
        .nullable()
        .optional(),
    birthdate: z
        .string()
        .trim()
        .optional()
        .refine((val) => {
            if (!val) return true;
            const birthDate = new Date(val + "T00:00:00");
            const today = new Date();
            return birthDate <= today;
        }, "La fecha de nacimiento no puede ser en el futuro")

        .refine((val) => {
            if (!val) return true;
            const birthDate = new Date(val + "T00:00:00");
            const today = new Date();

            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();

            if (
                monthDiff < 0 ||
                (monthDiff === 0 && today.getDate() < birthDate.getDate())
            ) {
                age--;
            }
            return age >= 14;
        }, "El usuario debe tener al menos 14 años de edad"),
});
