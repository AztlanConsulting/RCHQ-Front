import { z } from "zod";

const DATE_RANGE_ERROR =
    "La fecha de inicio no puede ser posterior a la fecha de término";

export const vacationRequestFiltersSchema = z
    .object({
        search: z.string().optional().default(""),
        startDate: z.string().optional().default(""),
        endDate: z.string().optional().default(""),
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

export const getVacationRequestFiltersError = (filters) => {
    const result = vacationRequestFiltersSchema.safeParse(filters);

    if (result.success) {
        return "";
    }

    return result.error.issues[0]?.message || "Filtros inválidos";
};
