import { useState, useEffect, useCallback } from "react";

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

const DEFAULT_FORM = {
    eventTypeId: "",
    description: "",
    allDay: false,
    date: "",
    startTime: "",
    endTime: "",
};

export const usePersonalForm = ({
    name,
    isOpen,
    onClose,
    onSuccess,
    initialStartDate,
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

        if (initialStartDate) {
            setForm((prev) => ({ ...prev, date: initialStartDate }));
        }
    }, [isOpen, initialStartDate, onValidationAlert]);

    const setField = useCallback((field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: undefined }));
    }, []);

    const handleSelectEmployee = useCallback((emp) => {
        setSelectedEmployees((prev) => [...prev, emp]);
    }, []);

    const handleRemoveEmployee = useCallback((employeeId) => {
        setSelectedEmployees((prev) =>
            prev.filter((e) => e.employeeId !== employeeId),
        );
    }, []);

    const validate = () => {
        const input = {
            ...form,
            name: name?.trim() ?? "",
            categoryKey: "personal",
            forceOverlap: false,
            employeeIds: selectedEmployees.map((e) => e.employeeId),
        };

        const result = personalEventSchema.safeParse(input);

        const extraMessages = [];
        if (isCoordinator && selectedEmployees.length === 0) {
            extraMessages.push("Debes seleccionar al menos un empleado");
        }

        if (result.success && extraMessages.length === 0) {
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

        setErrors(fieldErrors);
        onNameError?.(fieldErrors.name ?? "");

        const schemaMessages = result.success
            ? []
            : [...new Set(result.error.issues.map((i) => i.message))];

        onValidationAlert?.([...schemaMessages, ...extraMessages].join("\n"));

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
            buildPersonalPayload({ ...validated, forceOverlap: false }),
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

    const getTimeContainerStyle = (isVisible) => ({
        flex: isVisible ? 1 : "0 0 0px",
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
        getTimeContainerStyle,
    };
};
