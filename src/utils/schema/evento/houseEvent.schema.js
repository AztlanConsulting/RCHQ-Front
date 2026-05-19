import { z } from "zod";

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

const TEXT_REGEX = /^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s\-!¿¡?.,:;()]+$/;

const baseSchema = z.object({
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

    eventTypeId: z.uuid("Selecciona un tipo de evento"),

    description: z
        .string()
        .max(250, "Máximo 250 caracteres")
        .refine((val) => !val || TEXT_REGEX.test(val), "La descripción contiene caracteres no permitidos")
        .optional(),

    isFreeDay: z.boolean().default(false),

    forceOverlap: z.boolean().default(false),
});

const allDaySchema = baseSchema
    .extend({
        allDay: z.literal(true),
        startDate: z
            .string({ required_error: "La fecha de inicio es obligatoria" })
            .regex(dateRegex, "Fecha de inicio inválida"),
        endDate: z
            .string({ required_error: "La fecha de fin es obligatoria" })
            .regex(dateRegex, "Fecha de fin inválida"),
    })
    .refine((d) => d.startDate <= d.endDate, {
        message: "La fecha de fin no puede ser anterior a la de inicio",
        path: ["endDate"],
    });

const timedSchema = baseSchema
    .extend({
        allDay: z.literal(false),
        startDate: z
            .string({ required_error: "La fecha de inicio es obligatoria" })
            .regex(dateRegex, "Fecha de inicio inválida"),
        startTime: z
            .string({ required_error: "La hora de inicio es obligatoria" })
            .min(1, "La hora de inicio es obligatoria")
            .regex(timeRegex, "Hora de inicio inválida"),
        endDate: z
            .string({ required_error: "La fecha de fin es obligatoria" })
            .regex(dateRegex, "Fecha de fin inválida"),
        endTime: z
            .string({ required_error: "La hora de fin es obligatoria" })
            .min(1, "La hora de fin es obligatoria")
            .regex(timeRegex, "Hora de fin inválida"),
    })
    .refine(
        (d) => {
            const start = new Date(`${d.startDate}T${d.startTime}:00`);
            const end = new Date(`${d.endDate}T${d.endTime}:00`);
            return end > start;
        },
        {
            message: "La fecha/hora de fin debe ser posterior a la de inicio",
            path: ["endTime"],
        },
    );

export const houseEventSchema = z.discriminatedUnion("allDay", [
    allDaySchema,
    timedSchema,
]);

const TIMEZONE_OFFSET = "-06:00";

export function buildPayload(formData) {
    const {
        name,
        eventTypeId,
        description,
        allDay,
        isFreeDay,
        forceOverlap,
        startDate,
        endDate,
    } = formData;

    if (allDay) {
        return {
            eventTypeId,
            name,
            start: startDate,
            end: endDate,
            allDay: true,
            isFreeDay,
            ...(description?.trim() ? { description: description.trim() } : {}),
            forceOverlap,
        };
    }

    const { startTime, endTime } = formData;

    return {
        eventTypeId,
        name,
        start: `${startDate}T${startTime}:00.000${TIMEZONE_OFFSET}`,
        end: `${endDate}T${endTime}:00.000${TIMEZONE_OFFSET}`,
        allDay: false,
        isFreeDay,
        ...(description?.trim() ? { description: description.trim() } : {}),
        forceOverlap,
    };
}
