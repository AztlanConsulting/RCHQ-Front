import { useCallback, useEffect, useMemo, useState } from "react";

import { updatePersonalEvent } from "../../services/updateEventService";
import { getEventTypes, getEmployeesForSelector } from "../../services/eventService";
import { getCalendarViewerRole } from "../../services/calendarService";
import { normalizeDateOnly } from "../../utils/calendarEventDetail";
import {
    buildPersonalPayload,
    personalEventSchema,
} from "../../utils/schema/evento/personalEvent.schema";

const DEFAULT_FORM = {
    name: "",
    eventTypeId: "",
    description: "",
    allDay: false,
    date: "",
    startTime: "",
    endTime: "",
};

const TEXT_SANITIZER = /[^A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s\-!¿¡?.,:;()]/g;

const getTimeValue = (value) => {
    if (!value) return "";
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return `${String(date.getUTCHours()).padStart(2, "0")}:${String(date.getUTCMinutes()).padStart(2, "0")}`;
};

const getInitialForm = (event) => {
    if (!event) return DEFAULT_FORM;
    const date = normalizeDateOnly(event.date ?? event.start);
    return {
        name: event.title ?? "",
        eventTypeId: event.eventTypeId ?? "",
        description: event.description ?? "",
        allDay: Boolean(event.allDay),
        date,
        startTime: event.allDay ? "" : getTimeValue(event.start),
        endTime: event.allDay ? "" : getTimeValue(event.end),
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
}) => {
    const [form, setForm] = useState(DEFAULT_FORM);
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState(null);
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

    useEffect(() => {
        const role = getCalendarViewerRole();
        setIsCoordinator(role === "Coordinador");
    }, []);

    useEffect(() => {
        if (!isOpen) return;
        setForm(getInitialForm(event));
        setSelectedEmployees(getInitialEmployees(event));
        setErrors({});
        setServerError(null);
        setOverlapState({
            show: false,
            overlappedEmployees: [],
            pendingPayload: null,
            isForcing: false,
        });
    }, [event, isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        getEventTypes()
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
        setForm((prev) => ({
            ...prev,
            [field]:
                field === "name" || field === "description"
                    ? String(value).replace(TEXT_SANITIZER, "")
                    : value,
        }));
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

        const input = {
            ...form,
            categoryKey: "personal",
            forceOverlap: false,
            employeeIds: selectedEmployees.map((e) => e.employeeId),
        };

        const result = personalEventSchema.safeParse(input);

        if (result.success && !(isCoordinator && selectedEmployees.length === 0)) {
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

        setErrors(fieldErrors);
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
            buildPersonalPayload({ ...validated, forceOverlap: false }),
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
            setServerError(error?.message ?? "Error al forzar la modificación");
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
        eventTypes,
        employees,
        selectedEmployees,
        isSubmitting,
        isCoordinator,
        overlapState,
        setField,
        setServerError,
        searchEmployees,
        handleSelectEmployee,
        handleRemoveEmployee,
        handleSubmit,
        handleForceOverlap,
        handleCancelOverlap,
    };
};
