import { z } from "zod";

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const TEXT_REGEX = /^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s\-!¿¡?.,:;()]+$/;

export const baseSchema = z.object({
    name: z
        .string({ required_error: "El titulo es obligatorio" })
        .trim()
        .min(1, "El titulo es obligatorio")
        .min(3, "Titulo demasiado corto")
        .max(120, "Máximo 120 caracteres")
        .regex(TEXT_REGEX, "El título contiene caracteres no permitidos"),

    categoryKey: z
        .string({ required_error: "Selecciona una categoría" })
        .min(1, "Selecciona una categoría"),

    eventTypeId: z.string().uuid("Selecciona un tipo de evento"),

    description: z
        .string()
        .max(250, "Máximo 250 caracteres")
        .refine(
            (val) => !val || TEXT_REGEX.test(val),
            "La descripción contiene caracteres no permitidos",
        )
        .optional(),

    date: z
        .string({ required_error: "La fecha es obligatoria" })
        .regex(dateRegex, "Fecha inválida"),

    forceOverlap: z.boolean().default(false),

    employeeIds: z.array(z.string().uuid()).optional(),
});

export const allDaySchema = baseSchema.extend({
    allDay: z.literal(true),
});

export const timedSchema = baseSchema
    .extend({
        allDay: z.literal(false),
        startTime: z
            .string({ required_error: "La hora de inicio es obligatoria" })
            .min(1, "La hora de inicio es obligatoria")
            .regex(timeRegex, "Hora de inicio inválida"),
        endTime: z
            .string({ required_error: "La hora de fin es obligatoria" })
            .min(1, "La hora de fin es obligatoria")
            .regex(timeRegex, "Hora de fin inválida"),
    })
    .refine(
        (d) => {
            const start = new Date(`${d.date}T${d.startTime}:00`);
            const end = new Date(`${d.date}T${d.endTime}:00`);
            return end > start;
        },
        {
            message: "La hora de fin debe ser posterior a la de inicio",
            path: ["endTime"],
        },
    );

export const personalEventSchema = z.discriminatedUnion("allDay", [
    allDaySchema,
    timedSchema,
]);

export function buildPersonalPayload(formData) {
    const {
        name,
        eventTypeId,
        description,
        allDay,
        date,
        startTime,
        endTime,
        employeeIds,
        forceOverlap,
    } = formData;

    const base = {
        name,
        eventTypeId,
        date,
        allDay,
        ...(description?.trim() ? { description: description.trim() } : {}),
        employeeIds: employeeIds ?? [],
        forceOverlap,
    };

    if (allDay) return base;

    return {
        ...base,
        start: `${startTime}:00`,
        end: `${endTime}:00`,
    };
}
