import { useCallback, useEffect, useMemo, useState } from "react";

import EventService from "../../services/event.service";
import Dates from "@/utils/helpers/dates.helpers";
import {
    buildPayload,
    houseEventSchema,
} from "../../utils/schemas/calendar/houseEvent.schema";

const DEFAULT_FORM = {
    name: "",
    eventTypeId: "",
    description: "",
    allDay: false,
    isFreeDay: false,
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
};

const TEXT_SANITIZER = /[^A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s\-!¿¡?.,:;()]/g;

const getEventId = (event) => {
    const candidateId = event?.houseEventId ?? event?.eventId;
    if (candidateId) return candidateId;

    const fallbackId = String(event?.id ?? "");
    return /^\d+$/.test(fallbackId) ? "" : fallbackId;
};

const getTimeValue = (value) => {
    if (!value) return "";

    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    return `${String(date.getUTCHours()).padStart(2, "0")}:${String(
        date.getUTCMinutes(),
    ).padStart(2, "0")}`;
};

const getInitialForm = (event) => {
    if (!event) return DEFAULT_FORM;

    const startDate = Dates.normalizeDateOnly(event.startDate ?? event.start);
    const rawEndDate = Dates.normalizeDateOnly(
        event.endDate ?? event.end ?? event.start,
    );
    const endDate =
        event.allDay && rawEndDate > startDate
            ? Dates.addDaysToDateOnly(rawEndDate, -1)
            : rawEndDate;

    return {
        name: event.title ?? "",
        eventTypeId: event.eventTypeId ?? "",
        description: event.description ?? "",
        allDay: Boolean(event.allDay),
        isFreeDay: Boolean(event.isFreeDay),
        startDate,
        endDate,
        startTime: event.allDay
            ? ""
            : getTimeValue(event.start ?? event.startStr),
        endTime: event.allDay ? "" : getTimeValue(event.end ?? event.endStr),
    };
};

const getTimeContainerStyle = (isVisible) => ({
    flex: isVisible ? 0.9 : "0 0 0px",
    maxWidth: isVisible ? "100%" : "0px",
    opacity: isVisible ? 1 : 0,
    transform: isVisible
        ? "translateX(0) scale(1)"
        : "translateX(12px) scale(0.96)",
    pointerEvents: isVisible ? "auto" : "none",
    overflow: isVisible ? "visible" : "hidden",
    transition:
        "max-width 280ms ease, opacity 220ms ease, transform 260ms ease, flex 280ms ease",
});

export const useUpdateHouseEventForm = ({
    event,
    isOpen,
    onClose,
    onSuccess,
}) => {
    const [form, setForm] = useState(DEFAULT_FORM);
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState(null);
    const [eventTypes, setEventTypes] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [overlapState, setOverlapState] = useState({
        show: false,
        collisions: [],
        pendingPayload: null,
        isForcing: false,
    });

    const houseEventId = useMemo(() => getEventId(event), [event]);

    useEffect(() => {
        if (!isOpen) return;

        setForm(getInitialForm(event));
        setErrors({});
        setServerError(null);
        setOverlapState({
            show: false,
            collisions: [],
            pendingPayload: null,
            isForcing: false,
        });
    }, [event, isOpen]);

    useEffect(() => {
        if (!isOpen) return;

        EventService.getEventTypes()
            .then((types) => {
                const options = types.map((type) => ({
                    value: type.eventTypeId,
                    label: type.name,
                }));

                setEventTypes(options);

                setForm((prev) => {
                    if (prev.eventTypeId) return prev;

                    const matchedType = options.find(
                        (option) =>
                            option.label?.toLowerCase() ===
                            event?.eventType?.toLowerCase(),
                    );

                    return {
                        ...prev,
                        eventTypeId: matchedType?.value ?? "",
                    };
                });
            })
            .catch(() => {
                setEventTypes([]);
            });
    }, [event?.eventType, isOpen]);

    const setField = useCallback((field, value) => {
        setForm((prev) => ({
            ...prev,
            ...(field === "allDay" && value
                ? {
                      startTime: "",
                      endTime: "",
                  }
                : {}),
            [field]:
                field === "name" || field === "description"
                    ? String(value).replace(TEXT_SANITIZER, "")
                    : value,
        }));

        setErrors((prev) => ({
            ...prev,
            [field]: undefined,
            ...(field === "allDay" && value
                ? {
                      startTime: undefined,
                      endTime: undefined,
                  }
                : {}),
        }));
    }, []);

    const validate = () => {
        if (!houseEventId) {
            setServerError("No se encontró el identificador del evento.");
            return null;
        }

        const result = houseEventSchema.safeParse({
            ...form,
            categoryKey: "casa",
            forceOverlap: false,
        });

        if (result.success) {
            setErrors({});
            return result.data;
        }

        const fieldErrors = {};

        result.error.issues.forEach((error) => {
            const key = error.path[error.path.length - 1];
            if (key && !fieldErrors[key]) fieldErrors[key] = error.message;
        });

        setErrors(fieldErrors);
        return null;
    };

    const submitPayload = async (payload) => {
        setIsSubmitting(true);
        setServerError(null);

        try {
            const response = await EventService.updateHouseEvent(houseEventId, payload);

            if (!response.success && response.data?.collisions?.length) {
                setOverlapState({
                    show: true,
                    collisions: response.data.collisions,
                    pendingPayload: payload,
                    isForcing: false,
                });
                return;
            }

            onSuccess?.(response.data);
            onClose?.();
        } catch (error) {
            setServerError(
                error?.message ?? "Error inesperado al modificar el evento",
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmit = async () => {
        const validated = validate();
        if (!validated) return;

        await submitPayload(
            buildPayload({ ...validated, forceOverlap: false }),
        );
    };

    const handleForceOverlap = async () => {
        setOverlapState((prev) => ({ ...prev, isForcing: true }));

        try {
            const response = await EventService.updateHouseEvent(houseEventId, {
                ...overlapState.pendingPayload,
                forceOverlap: true,
            });

            onClose?.();
            setOverlapState({
                show: false,
                collisions: [],
                pendingPayload: null,
                isForcing: false,
            });
            await onSuccess?.(response.data);
        } catch (error) {
            setOverlapState({
                show: false,
                collisions: [],
                pendingPayload: null,
                isForcing: false,
            });
            setServerError(error?.message ?? "Error al forzar la modificación");
        }
    };

    const handleCancelOverlap = () => {
        setOverlapState({
            show: false,
            collisions: [],
            pendingPayload: null,
            isForcing: false,
        });
    };

    return {
        form,
        errors,
        serverError,
        eventTypes,
        isSubmitting,
        overlapState,
        setField,
        setServerError,
        handleSubmit,
        handleForceOverlap,
        handleCancelOverlap,
        getTimeContainerStyle,
    };
};
