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

const resolveTimedEndDate = (date, endTime) =>
    String(endTime).slice(0, 5) === "00:00"
        ? addDaysToDateOnly(date, 1)
        : date;

export const baseSchema = z.object({
    name: z
        .string({ required_error: "El titulo es obligatorio" })
        .trim()
        .min(1, "El titulo es obligatorio")
        .min(3, "Titulo demasiado corto")
        .max(70, "Máximo 70 caracteres")
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

    trainer: z
        .string()
        .max(150, "Máximo 150 caracteres")
        .refine(
            (val) => !val || TEXT_REGEX.test(val),
            "El instructor contiene caracteres no permitidos",
        )
        .optional(),

    date: z
        .string({ required_error: "La fecha es obligatoria" })
        .regex(dateRegex, "Fecha inválida")
        .refine(
            (val) => {
                const d = new Date();
                const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
                return val >= today;
            },
            "La fecha no puede ser anterior al día de hoy",
        )
        .refine(
            (val) => {
                const d = new Date();
                const maxStr = `${d.getFullYear() + 2}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
                return val <= maxStr;
            },
            "La fecha no puede exceder 2 años a partir de hoy",
        ),

    endDate: z.string().regex(dateRegex, "Fecha final inválida").optional(),

    forceOverlap: z.boolean().default(false),

    employeeIds: z.array(z.string().uuid()).optional(),

    trainer: z
        .string()
        .max(150, "Máximo 150 caracteres")
        .refine(
            (val) => !val || TEXT_REGEX.test(val),
            "El instructor contiene caracteres no permitidos",
        )
        .optional(),

    isTraining: z.boolean().optional(),
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
            const end = new Date(
                `${d.endDate ?? resolveTimedEndDate(d.date, d.endTime)}T${d.endTime}:00`,
            );
            return end > start;
        },
        {
            message: "La hora de fin debe ser posterior a la de inicio",
            path: ["endTime"],
        },
    );

export const personalEventSchema = z
    .discriminatedUnion("allDay", [allDaySchema, timedSchema])
    .superRefine((data, ctx) => {
        if (data.isTraining && !data.trainer?.trim()) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message:
                    "El capacitador es obligatorio para eventos de capacitación.",
                path: ["trainer"],
            });
        }
    });

export function buildPersonalPayload(formData) {
    const {
        name,
        eventTypeId,
        description,
        trainer,
        allDay,
        date,
        endDate,
        startTime,
        endTime,
        employeeIds,
        forceOverlap,
        timeZone = getBrowserTimeZone(),
    } = formData;

    const base = {
        name,
        eventTypeId,
        date,
        allDay,
        timeZone,
        ...(description?.trim() ? { description: description.trim() } : {}),
        ...(trainer?.trim() ? { trainer: trainer.trim() } : {}),
        employeeIds: employeeIds ?? [],
        forceOverlap,
    };

    if (allDay) {
        const mexicoEndDate = addDaysToDateOnly(date, 1);

        return {
            ...base,
            timeZone: MEXICO_TIME_ZONE,
            start: zonedDateTimeToIso(date, "00:00", MEXICO_TIME_ZONE),
            end: zonedDateTimeToIso(mexicoEndDate, "00:00", MEXICO_TIME_ZONE),
        };
    }

    const resolvedEndDate = endDate ?? resolveTimedEndDate(date, endTime);

    return {
        ...base,
        start: zonedDateTimeToIso(date, startTime, timeZone),
        end: zonedDateTimeToIso(resolvedEndDate, endTime, timeZone),
    };
}
