import { useCallback, useEffect, useMemo, useState } from "react";

import { updatePersonalEvent } from "../../services/updateEventService";
import { getEventTypes, getEmployeesForSelector } from "../../services/eventService";
import { getCalendarViewerRole } from "../../services/calendarService";
import { normalizeDateOnly } from "../../utils/calendarEventDetail";
import {
    getPersonalEventMexicoRangeError,
    getPersonalMexicoRangeErrorKey,
    shouldShowPersonalEndDateField,
} from "../../utils/schema/evento/personalEventRules";
import { shiftSameDayTimeRange } from "../../utils/dateRangeShift";
import {
    dateInTimeZoneToInputValue,
    timeInTimeZoneToInputValue,
} from "../../utils/timeZone";
import {
    buildPersonalPayload,
    personalEventSchema,
} from "../../utils/schema/evento/personalEvent.schema";

const DEFAULT_FORM = {
    name: "",
    eventTypeId: "",
    description: "",
    trainer: "",
    allDay: false,
    date: "",
    endDate: "",
    startTime: "",
    endTime: "",
};

const TEXT_SANITIZER = /[^A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s\-!¿¡?.,:;()]/g;

const getInitialForm = (event, calendarTimeZone) => {
    if (!event) return DEFAULT_FORM;
    const calendarStartDate = dateInTimeZoneToInputValue(
        event.start,
        calendarTimeZone,
    );
    const date = event.allDay
        ? normalizeDateOnly(event.date) || calendarStartDate
        : calendarStartDate || normalizeDateOnly(event.date);
    const endDate = event.allDay
        ? date
        : dateInTimeZoneToInputValue(event.end ?? event.start, calendarTimeZone);

    return {
        name: event.title ?? "",
        eventTypeId: event.eventTypeId ?? "",
        description: event.description ?? "",
        trainer: event.trainer ?? "",
        allDay: Boolean(event.allDay),
        date,
        endDate: endDate || date,
        startTime: event.allDay
            ? ""
            : timeInTimeZoneToInputValue(event.start, calendarTimeZone),
        endTime: event.allDay
            ? ""
            : timeInTimeZoneToInputValue(event.end, calendarTimeZone),
    };
};

const getInitialEmployees = (event) => {
    if (!Array.isArray(event?.peopleInsideEvent)) return [];
    return event.peopleInsideEvent.map((p) => ({
        employeeId: p.id,
        fullName: p.name,
        picture: null,
    }));
};


export const useUpdatePersonalEventForm = ({
    event,
    isOpen,
    onClose,
    onSuccess,
    calendarTimeZone,
    calendarTimeZoneMode,
    canSwitchCalendarTimeZone,
}) => {
    const [form, setForm] = useState(DEFAULT_FORM);
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState(null);
    const [validationAlert, setValidationAlert] = useState(null);
    const [eventTypes, setEventTypes] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [selectedEmployees, setSelectedEmployees] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCoordinator, setIsCoordinator] = useState(false);
    const [overlapState, setOverlapState] = useState({
        show: false,
        overlappedEmployees: [],
        pendingPayload: null,
        isForcing: false,
    });

    const personalEventId = useMemo(() => event?.eventId ?? "", [event]);
    const isPastEvent = useMemo(() => {
        if (!event?.start) return false;
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const eventDayStart = new Date(event.start);
        eventDayStart.setHours(0, 0, 0, 0);
        return eventDayStart < todayStart;
    }, [event?.start]);
    const isCapacitaciones = useMemo(() => {
        if (eventTypes.length > 0) {
            return (
                eventTypes.find((t) => t.value === form.eventTypeId)?.label?.toLowerCase() ===
                "capacitaciones"
            );
        }
        return event?.eventType?.toLowerCase() === "capacitaciones";
    }, [event?.eventType, eventTypes, form.eventTypeId]);
    const showEndDateField = shouldShowPersonalEndDateField({
        allDay: form.allDay,
        calendarTimeZoneMode,
        canSwitchCalendarTimeZone,
    });
    const effectiveEndDate = showEndDateField
        ? form.endDate || form.date
        : undefined;

    useEffect(() => {
        const role = getCalendarViewerRole();
        setIsCoordinator(role === "Coordinador");
    }, []);

    useEffect(() => {
        if (!isOpen) return;
        setForm(getInitialForm(event, calendarTimeZone));
        setSelectedEmployees(getInitialEmployees(event));
        setErrors({});
        setServerError(null);
        setValidationAlert(null);
        setOverlapState({
            show: false,
            overlappedEmployees: [],
            pendingPayload: null,
            isForcing: false,
        });
    }, [calendarTimeZone, event, isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        getEventTypes("personal")
            .then((types) => {
                const options = types.map((t) => ({
                    value: t.eventTypeId,
                    label: t.name,
                }));
                setEventTypes(options);
                setForm((prev) => {
                    if (prev.eventTypeId) return prev;
                    const matched = options.find(
                        (o) =>
                            o.label?.toLowerCase() ===
                            event?.eventType?.toLowerCase(),
                    );
                    return { ...prev, eventTypeId: matched?.value ?? "" };
                });
            })
            .catch(() => setEventTypes([]));
    }, [event?.eventType, isOpen]);

    const searchEmployees = useCallback(
        async (query) => {
            if (!isCoordinator) return;
            try {
                const results = await getEmployeesForSelector(
                    query ? { search: query } : {},
                );
                setEmployees(results);
            } catch (error){
                console.error(error)
            }
        },
        [isCoordinator],
    );

    const setField = useCallback((field, value) => {
        setForm((prev) => {
            const nextValue =
                field === "name" || field === "description" || field === "trainer"
                    ? String(value).replace(TEXT_SANITIZER, "")
                    : value;

            return shiftSameDayTimeRange(prev, field, nextValue);
        });
        setErrors((prev) => ({
            ...prev,
            [field]: undefined,
        }));
    }, []);

    const handleSelectEmployee = useCallback((emp) => {
        setSelectedEmployees((prev) => [...prev, emp]);
        setErrors((prev) => ({ ...prev, employees: undefined }));
    }, []);

    const handleRemoveEmployee = useCallback((employeeId) => {
        setSelectedEmployees((prev) =>
            prev.filter((e) => e.employeeId !== employeeId),
        );
    }, []);

    const validate = () => {
        if (!personalEventId) {
            setServerError("No se encontró el identificador del evento.");
            return null;
        }

        const today = new Date();
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
        const validationDate = isPastEvent ? todayStr : form.date;
        const validationEndDate = isPastEvent
            ? (effectiveEndDate ? todayStr : undefined)
            : effectiveEndDate;

        const input = {
            ...form,
            date: validationDate,
            endDate: validationEndDate,
            categoryKey: "personal",
            forceOverlap: false,
            employeeIds: selectedEmployees.map((e) => e.employeeId),
            isCapacitaciones,
        };
        const mexicoRangeError = isPastEvent ? null : getPersonalEventMexicoRangeError({
            startDate: form.date,
            endDate: effectiveEndDate ?? form.date,
            startTime: form.startTime,
            endTime: form.endTime,
            allDay: form.allDay,
            calendarTimeZone,
        });

        const result = personalEventSchema.safeParse(input);

        if (
            result.success &&
            !mexicoRangeError &&
            !(isCoordinator && selectedEmployees.length === 0)
        ) {
            setErrors({});
            return result.data;
        }

        const fieldErrors = {};

        if (!result.success) {
            result.error.issues.forEach((issue) => {
                const key = issue.path[issue.path.length - 1];
                if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
            });
        }

        if (isCoordinator && selectedEmployees.length === 0) {
            fieldErrors.employees = "Debes seleccionar al menos un empleado.";
        }

        if (mexicoRangeError) {
            fieldErrors[getPersonalMexicoRangeErrorKey(form.allDay)] =
                mexicoRangeError;
        }

        setErrors(fieldErrors);
        setValidationAlert("Revisa los campos marcados antes de continuar.");
        return null;
    };

    const submitPayload = async (payload) => {
        setIsSubmitting(true);
        setServerError(null);
        try {
            const response = await updatePersonalEvent(personalEventId, payload);

            if (
                !response.success &&
                response.data?.overlappedEmployees?.length
            ) {
                setOverlapState({
                    show: true,
                    overlappedEmployees: response.data.overlappedEmployees,
                    pendingPayload: payload,
                    isForcing: false,
                });
                return;
            }

            onSuccess?.(response.data);
            onClose?.();
        } catch (error) {
            setServerError(
                error?.message ?? "Error inesperado al editar el evento",
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmit = async () => {
        const validated = validate();
        if (!validated) return;
        await submitPayload(
            buildPersonalPayload({
                ...validated,
                date: form.date,
                endDate: effectiveEndDate,
                trainer: isCapacitaciones ? form.trainer?.trim() || null : null,
                forceOverlap: false,
                timeZone: calendarTimeZone,
            }),
        );
    };

    const handleForceOverlap = async () => {
        setOverlapState((prev) => ({ ...prev, isForcing: true }));
        try {
            const response = await updatePersonalEvent(personalEventId, {
                ...overlapState.pendingPayload,
                forceOverlap: true,
            });

            onSuccess?.(response.data);
            onClose?.();
            setOverlapState({
                show: false,
                overlappedEmployees: [],
                pendingPayload: null,
                isForcing: false,
            });
        } catch (error) {
            setOverlapState({
                show: false,
                overlappedEmployees: [],
                pendingPayload: null,
                isForcing: false,
            });
            setServerError(error?.message ?? "Error al forzar la edición");
        }
    };

    const handleCancelOverlap = () => {
        setOverlapState({
            show: false,
            overlappedEmployees: [],
            pendingPayload: null,
            isForcing: false,
        });
    };

    return {
        form,
        errors,
        serverError,
        validationAlert,
        eventTypes,
        employees,
        selectedEmployees,
        isSubmitting,
        isCoordinator,
        isCapacitaciones,
        overlapState,
        showEndDateField,
        setField,
        setServerError,
        setValidationAlert,
        searchEmployees,
        handleSelectEmployee,
        handleRemoveEmployee,
        handleSubmit,
        handleForceOverlap,
        handleCancelOverlap,
    };
};
