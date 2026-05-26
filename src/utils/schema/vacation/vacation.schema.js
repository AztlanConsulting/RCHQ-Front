import { z } from "zod";

const DATE_RANGE_ERROR =
    "La fecha de inicio no puede ser posterior a la fecha de término";

const DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const requiredDate = (requiredMessage) =>
    z
        .string()
        .trim()
        .min(1, requiredMessage)
        .regex(DATE_ONLY_REGEX, "Selecciona una fecha válida");

export const vacationRequestFiltersSchema = z
    .object({
        search: z.string().optional().default(""),
        startDate: z
            .string()
            .trim()
            .optional()
            .default("")
            .refine(
                (value) => value === "" || DATE_ONLY_REGEX.test(value),
                "Selecciona una fecha válida",
            ),
        endDate: z
            .string()
            .trim()
            .optional()
            .default("")
            .refine(
                (value) => value === "" || DATE_ONLY_REGEX.test(value),
                "Selecciona una fecha válida",
            ),
        status: z.string().optional().default("all"),
    })
    .superRefine((data, ctx) => {
        if (!data.startDate || !data.endDate) return;

        if (data.startDate > data.endDate) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["startDate"],
                message: DATE_RANGE_ERROR,
            });
        }
    });

export const vacationFormSchema = z
    .object({
        employeeId: z
            .string()
            .trim()
            .min(1, "Selecciona un empleado"),

        startDate: requiredDate("Selecciona la fecha de inicio"),

        endDate: requiredDate("Selecciona la fecha de fin"),
    })
    .superRefine((data, ctx) => {
        if (!data.startDate || !data.endDate) return;

        if (data.startDate > data.endDate) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["endDate"],
                message: "La fecha de inicio no puede ser posterior a la fecha de fin",
            });
        }
    });

export const getVacationRequestFiltersError = (filters) => {
    const result = vacationRequestFiltersSchema.safeParse(filters);

    if (result.success) {
        return "";
    }

    return result.error.issues[0]?.message || "Filtros inválidos";
};

export const getVacationFormErrors = (form) => {
    const result = vacationFormSchema.safeParse(form);

    if (result.success) {
        return {
            success: true,
            data: result.data,
            errors: {},
        };
    }

    const errors = result.error.issues.reduce((acc, issue) => {
        const field = issue.path[0];

        if (field && !acc[field]) {
            acc[field] = issue.message;
        }

        return acc;
    }, {});

    return {
        success: false,
        data: null,
        errors,
    };
};

export const vacationEditDatesSchema = z
    .object({
        vacationRequestId: z
            .string()
            .trim()
            .min(1, "No se encontró la solicitud de vacaciones")
            .max(80, "Identificador de solicitud inválido"),

        startDate: requiredDate("Selecciona la fecha de inicio"),

        endDate: requiredDate("Selecciona la fecha de fin"),
    })
    .superRefine((data, ctx) => {
        if (!data.startDate || !data.endDate) return;

        if (data.startDate > data.endDate) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["endDate"],
                message: "La fecha de inicio no puede ser posterior a la fecha de fin",
            });
        }
    });

export const getVacationEditDatesErrors = (form) => {
    const result = vacationEditDatesSchema.safeParse(form);

    if (result.success) {
        return {
            success: true,
            data: result.data,
            errors: {},
        };
    }

    const errors = result.error.issues.reduce((acc, issue) => {
        const field = issue.path[0];

        if (field && !acc[field]) {
            acc[field] = issue.message;
        }

        return acc;
    }, {});

    return {
        success: false,
        data: null,
        errors,
    };
};

export const VACATION_REJECTION_FEEDBACK_MAX_LENGTH = 500;
const VACATION_REJECTION_FEEDBACK_EMOJI_SEQUENCE_REGEX =
    "(?:\\p{Regional_Indicator}{2}|\\p{Extended_Pictographic}(?:\\uFE0F|\\p{Emoji_Modifier})?(?:\\u200D\\p{Extended_Pictographic}(?:\\uFE0F|\\p{Emoji_Modifier})?)*)";
const VACATION_REJECTION_FEEDBACK_ALLOWED_CHAR_REGEX =
    "[\\p{L}\\p{M}\\p{N} \\r\\n.,:;()¿?¡!/-]";
export const VACATION_REJECTION_FEEDBACK_ALLOWED_CHARS_REGEX = new RegExp(
    `^(?:${VACATION_REJECTION_FEEDBACK_ALLOWED_CHAR_REGEX}|${VACATION_REJECTION_FEEDBACK_EMOJI_SEQUENCE_REGEX})*$`,
    "u",
);
const VACATION_REJECTION_FEEDBACK_ALLOWED_TOKEN_REGEX = new RegExp(
    `${VACATION_REJECTION_FEEDBACK_EMOJI_SEQUENCE_REGEX}|${VACATION_REJECTION_FEEDBACK_ALLOWED_CHAR_REGEX}`,
    "gu",
);

export const sanitizeVacationRejectionFeedback = (value = "") =>
    String(value).match(VACATION_REJECTION_FEEDBACK_ALLOWED_TOKEN_REGEX)?.join("") ??
    "";

export const vacationRejectionFeedbackSchema = z.object({
    feedback: z
        .string()
        .trim()
        .max(
            VACATION_REJECTION_FEEDBACK_MAX_LENGTH,
            `La retroalimentación no puede exceder ${VACATION_REJECTION_FEEDBACK_MAX_LENGTH} caracteres`,
        )
        .regex(
            VACATION_REJECTION_FEEDBACK_ALLOWED_CHARS_REGEX,
            "La retroalimentación solo puede contener letras, números, espacios y signos básicos",
        )
        .optional()
        .default(""),
});

export const getVacationRejectionFeedbackErrors = (form) => {
    const result = vacationRejectionFeedbackSchema.safeParse(form);

    if (result.success) {
        return {
            success: true,
            data: result.data,
            errors: {},
        };
    }

    const errors = result.error.issues.reduce((acc, issue) => {
        const field = issue.path[0];

        if (field && !acc[field]) {
            acc[field] = issue.message;
        }

        return acc;
    }, {});

    return {
        success: false,
        data: null,
        errors,
    };
};
