import { z } from "zod";

const REQUIRED_FIELD_MESSAGE = "Campo obligatorio";

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

const DESCRIPTION_REGEX = /^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s¿?¡!,.\-+#"_]+$/;
const DESCRIPTION_INVALID_REGEX = /[^A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s¿?¡!,.\-+#"_]/;

export const sanitizeAbsenceDescription = (value, fallback = "") => {
    const nextValue = String(value ?? "");

    return DESCRIPTION_INVALID_REGEX.test(nextValue) ? fallback : nextValue;
};

export const buildAbsenceFormSchema = ({
    minStartDateValue,
    maxEndDateValue,
}) =>
    z
        .object({
            employeeId: z
                .string({ required_error: REQUIRED_FIELD_MESSAGE })
                .min(1, REQUIRED_FIELD_MESSAGE),

            absenceTypeId: z
                .string({ required_error: REQUIRED_FIELD_MESSAGE })
                .min(1, REQUIRED_FIELD_MESSAGE),

            startDate: z
                .string({ required_error: REQUIRED_FIELD_MESSAGE })
                .min(1, REQUIRED_FIELD_MESSAGE)
                .length(10, "El tamaño de la fecha debe ser de 10 caracteres")
                .regex(dateRegex, "Fecha solo puede tener un formato YYYY-MM-DD")
                .refine((date) => date >= minStartDateValue, {
                    message:
                        "Fecha de inicio no puede ser menor a un mes antes del día actual.",
                }),

            endDate: z
                .string({ required_error: REQUIRED_FIELD_MESSAGE })
                .min(1, REQUIRED_FIELD_MESSAGE)
                .length(10, "El tamaño de la fecha debe ser de 10 caracteres")
                .regex(dateRegex, "Fecha solo puede tener un formato YYYY-MM-DD")
                .refine((date) => date <= maxEndDateValue, {
                    message: "Fecha de fin no puede ser mayor a un año.",
                }),

            description: z
                .string({ required_error: REQUIRED_FIELD_MESSAGE })
                .trim()
                .min(1, REQUIRED_FIELD_MESSAGE)
                .max(200, "Descripción no puede ser mayor a 200 caracteres")
                .regex(
                    DESCRIPTION_REGEX,
                    "Descripción no permite caracteres especiales",
                ),
        })
        .refine(
            (data) =>
                !dateRegex.test(data.startDate) ||
                !dateRegex.test(data.endDate) ||
                data.startDate.length !== 10 ||
                data.endDate.length !== 10 ||
                data.startDate < minStartDateValue ||
                data.endDate > maxEndDateValue ||
                data.startDate <= data.endDate,
            {
                message: "Fecha de inicio no puede ser mayor a la de fin",
                path: ["startDate"],
            },
        );
