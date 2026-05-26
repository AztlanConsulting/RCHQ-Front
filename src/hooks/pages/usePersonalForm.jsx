import { useState, useEffect, useCallback, useMemo } from "react";

import {
    createPersonalEvent,
    getEventTypes,
    getEmployeesForSelector,
} from "../../services/eventService";

import { getCalendarViewerRole } from "../../services/calendarService";

import {
    personalEventSchema,
    buildPersonalPayload,
} from "../../utils/schema/evento/personalEvent.schema";
import {
    getPersonalEventMexicoRangeError,
    getPersonalMexicoRangeErrorKey,
    shouldShowPersonalEndDateField,
} from "../../utils/schema/evento/personalEventRules";

const DEFAULT_FORM = {
    eventTypeId: "",
    description: "",
    allDay: false,
    date: "",
    endDate: "",
    startTime: "",
    endTime: "",
};

const getSelectionEndDate = (initialStartDate, initialEndDate, formDate) =>
    initialStartDate &&
    initialStartDate === formDate &&
    initialEndDate &&
    initialEndDate !== formDate
        ? initialEndDate
        : undefined;

export const usePersonalForm = ({
    name,
    isOpen,
    onClose,
    onSuccess,
    initialStartDate,
    initialEndDate,
    initialStartTime,
    initialEndTime,
    initialAllDay,
    calendarTimeZone,
    calendarTimeZoneMode,
    canSwitchCalendarTimeZone,
    onNameError,
    onValidationAlert,
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

    useEffect(() => {
        const role = getCalendarViewerRole();
        setIsCoordinator(role === "Coordinador");
    }, []);

    useEffect(() => {
        if (!isOpen) return;

        getEventTypes()
            .then((types) =>
                setEventTypes(
                    types.map((t) => ({
                        value: t.eventTypeId,
                        label: t.name,
                    })),
                ),
            )
            .catch(() => {});
    }, [isOpen]);

    const searchEmployees = useCallback(
        async (query) => {
            if (!isCoordinator) return;
            try {
                const results = await getEmployeesForSelector(
                    query ? { search: query } : {},
                );
                setEmployees(results);
            } catch (error) {
                console.error(error);
            }
        },
        [isCoordinator],
    );

    useEffect(() => {
        if (!isOpen) {
            setForm(DEFAULT_FORM);
            setErrors({});
            setServerError(null);
            setSelectedEmployees([]);
            onValidationAlert?.(null);

            setOverlapState({
                show: false,
                overlappedEmployees: [],
                pendingPayload: null,
                isForcing: false,
            });

            return;
        }

        if (
            initialStartDate ||
            initialEndDate ||
            initialStartTime ||
            initialEndTime ||
            initialAllDay != null
        ) {
            setForm((prev) => ({
                ...prev,
                date: initialStartDate ?? prev.date,
                endDate:
                    initialEndDate ??
                    initialStartDate ??
                    prev.endDate,
                allDay: initialAllDay ?? prev.allDay,
                startTime: initialStartTime ?? prev.startTime,
                endTime: initialEndTime ?? prev.endTime,
            }));
        }
    }, [
        isOpen,
        initialStartDate,
        initialEndDate,
        initialStartTime,
        initialEndTime,
        initialAllDay,
        onValidationAlert,
    ]);

    const showEndDateField = shouldShowPersonalEndDateField({
        allDay: form.allDay,
        calendarTimeZoneMode,
        canSwitchCalendarTimeZone,
    });

    const effectiveEndDate = useMemo(
        () =>
            showEndDateField
                ? form.endDate || form.date
                : getSelectionEndDate(
                      initialStartDate,
                      initialEndDate,
                      form.date,
                  ),
        [
            form.date,
            form.endDate,
            initialEndDate,
            initialStartDate,
            showEndDateField,
        ],
    );

    const selectionMexicoRangeError = useMemo(() => {
        if (!isOpen) return "";

        return getPersonalEventMexicoRangeError({
            startDate: form.date,
            endDate: effectiveEndDate ?? form.date,
            startTime: form.startTime,
            endTime: form.endTime,
            allDay: form.allDay,
            calendarTimeZone,
        });
    }, [
        calendarTimeZone,
        effectiveEndDate,
        form.allDay,
        form.date,
        form.endTime,
        form.startTime,
        isOpen,
    ]);

    const displayErrors = useMemo(
        () => {
            if (!selectionMexicoRangeError) return errors;

            const errorKey = getPersonalMexicoRangeErrorKey(form.allDay);

            return {
                ...errors,
                [errorKey]: errors[errorKey] ?? selectionMexicoRangeError,
            };
        },
        [errors, form.allDay, selectionMexicoRangeError],
    );

    const setField = useCallback((field, value) => {
        setForm((prev) => {
            const next = { ...prev, [field]: value };

            if (field === "date" && (!prev.endDate || prev.endDate < value)) {
                next.endDate = value;
            }

            if (field === "allDay" && value) {
                next.endDate = next.date;
            }

            return next;
        });
        setErrors((prev) => ({ ...prev, [field]: undefined }));
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
        const mexicoRangeError = getPersonalEventMexicoRangeError({
            startDate: form.date,
            endDate: effectiveEndDate ?? form.date,
            startTime: form.startTime,
            endTime: form.endTime,
            allDay: form.allDay,
            calendarTimeZone,
        });

        const input = {
            ...form,
            name: name?.trim() ?? "",
            categoryKey: "personal",
            endDate: effectiveEndDate,
            forceOverlap: false,
            employeeIds: selectedEmployees.map((e) => e.employeeId),
        };

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
                if (key && !fieldErrors[key]) {
                    fieldErrors[key] = issue.message;
                }
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
        onNameError?.(fieldErrors.name ?? "");

        onValidationAlert?.("Revisa los campos marcados antes de continuar.");

        return null;
    };

    const submitPayload = async (payload) => {
        setIsSubmitting(true);

        try {
            const response = await createPersonalEvent(payload);

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
            onClose();
        } catch (err) {
            const detail = err.body ? JSON.stringify(err.body) : null;
            setServerError(
                detail ??
                    err.message ??
                    "Error inesperado al registrar el evento",
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
                endDate: effectiveEndDate,
                forceOverlap: false,
                timeZone: calendarTimeZone,
            }),
        );
    };

    const handleForceOverlap = async () => {
        setOverlapState((prev) => ({ ...prev, isForcing: true }));

        try {
            const response = await createPersonalEvent({
                ...overlapState.pendingPayload,
                forceOverlap: true,
            });

            onSuccess?.(response.data);
            onClose();
        } catch (err) {
            setOverlapState({
                show: false,
                overlappedEmployees: [],
                pendingPayload: null,
                isForcing: false,
            });
            setServerError(err.message ?? "Error al forzar el registro");
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
        errors: displayErrors,
        serverError,
        eventTypes,
        employees,
        selectedEmployees,
        isSubmitting,
        isCoordinator,
        overlapState,
        showEndDateField,
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
