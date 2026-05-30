import { z } from "zod";
import {
    addDaysToDateOnly,
    getBrowserTimeZone,
    MEXICO_TIME_ZONE,
    zonedDateTimeToIso,
} from "./dateTime";

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

function getHouseDateMin() {
    return `${new Date().getFullYear()}-01-01`;
}

function getHouseDateMax() {
    return `${new Date().getFullYear() + 2}-12-31`;
}

const houseDateField = (required_error, invalidMsg) =>
    z
        .string({ required_error })
        .regex(dateRegex, invalidMsg)
        .refine(
            (val) => val >= getHouseDateMin(),
            () => `La fecha no puede ser anterior al 1 de enero de ${new Date().getFullYear()}`,
        )
        .refine(
            (val) => val <= getHouseDateMax(),
            () => `La fecha no puede ser posterior al 31 de diciembre de ${new Date().getFullYear() + 2}`,
        );

const allDaySchema = baseSchema
    .extend({
        allDay: z.literal(true),
        startDate: houseDateField("La fecha de inicio es obligatoria", "Fecha de inicio inválida"),
        endDate: houseDateField("La fecha de fin es obligatoria", "Fecha de fin inválida"),
    })
    .refine((d) => d.startDate <= d.endDate, {
        message: "La fecha de fin no puede ser anterior a la de inicio",
        path: ["endDate"],
    });

const timedSchema = baseSchema
    .extend({
        allDay: z.literal(false),
        startDate: houseDateField("La fecha de inicio es obligatoria", "Fecha de inicio inválida"),
        startTime: z
            .string({ required_error: "La hora de inicio es obligatoria" })
            .min(1, "La hora de inicio es obligatoria")
            .regex(timeRegex, "Hora de inicio inválida"),
        endDate: houseDateField("La fecha de fin es obligatoria", "Fecha de fin inválida"),
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
        timeZone = getBrowserTimeZone(),
    } = formData;

    if (isFreeDay) {
        return {
            eventTypeId,
            name,
            start: startDate,
            end: endDate,
            allDay: true,
            isFreeDay,
            timeZone: MEXICO_TIME_ZONE,
            ...(description?.trim() ? { description: description.trim() } : {}),
            forceOverlap,
        };
    }

    if (allDay) {
        return {
            eventTypeId,
            name,
            start: zonedDateTimeToIso(startDate, "00:00", timeZone),
            end: zonedDateTimeToIso(
                addDaysToDateOnly(endDate, 1),
                "00:00",
                timeZone,
            ),
            allDay: true,
            isFreeDay: false,
            timeZone,
            ...(description?.trim() ? { description: description.trim() } : {}),
            forceOverlap,
        };
    }

    const { startTime, endTime } = formData;

    return {
        eventTypeId,
        name,
        start: zonedDateTimeToIso(startDate, startTime, timeZone),
        end: zonedDateTimeToIso(endDate, endTime, timeZone),
        allDay: false,
        isFreeDay,
        timeZone,
        ...(description?.trim() ? { description: description.trim() } : {}),
        forceOverlap,
    };
}
