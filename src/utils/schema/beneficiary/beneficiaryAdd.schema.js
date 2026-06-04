import { z } from "zod";

const CURP_REGEX = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/;
const NAMES_REGEX = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const BLOOD_TYPES = ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"];

const emptyToNull = (val) => (val === "" || val == null ? null : val);

const nameField = (label) =>
    z
        .string()
        .trim()
        .min(2, `${label} es obligatorio`)
        .max(50, `${label} es demasiado largo`)
        .regex(NAMES_REGEX, `No se permiten caracteres especiales en ${label.toLowerCase()}`);

export const beneficiaryCreateSchema = z.object({
    name: nameField("El nombre"),
    maternal_surname: nameField("El apellido materno"),
    paternal_surname: nameField("El apellido paterno"),
    preferred_name: nameField("El nombre preferido"),
    birth_date: z
        .string()
        .trim()
        .regex(DATE_REGEX, "Formato de fecha inválido (YYYY-MM-DD)")
        .refine((val) => !Number.isNaN(new Date(val + "T00:00:00").getTime()), {
            message: "Fecha de nacimiento inválida",
        })
        .refine((val) => new Date(val + "T00:00:00") <= new Date(), {
            message: "La fecha de nacimiento no puede ser futura",
        }),
    age_entered_house: z.coerce
        .number({
            required_error: "La edad al entrar en la casa es obligatoria",
            invalid_type_error: "La edad al entrar en la casa es obligatoria",
        })
        .int("La edad al entrar en la casa debe ser un número entero")
        .min(0, "La edad al entrar en la casa no puede ser negativa")
        .max(25, "La edad al entrar en la casa no es válida"),
    blood_type: z.enum(BLOOD_TYPES, {
        errorMap: () => ({
            message:
                "El tipo de sangre debe ser O-, O+, A-, A+, B-, B+, AB- o AB+",
        }),
    }),
    curp: z.preprocess(
        (val) => emptyToNull(val === undefined ? "" : val),
        z
            .string()
            .nullable()
            .refine((val) => val === null || val.length === 18, {
                message: "El CURP debe tener exactamente 18 caracteres",
            })
            .refine((val) => val === null || CURP_REGEX.test(val), {
                message: "Formato del CURP inválido",
            })
            .transform((val) => (val === null ? null : val.toUpperCase())),
    ),
});

export const BLOOD_TYPE_OPTIONS = BLOOD_TYPES.map((type) => ({
    value: type,
    label: type,
}));
