import { useState, useEffect, useCallback } from "react";

import { createHouseEvent, getEventTypes } from "../../services/eventService";

import {
    houseEventSchema,
    buildPayload,
} from "../../utils/schema/evento/houseEvent.schema";

const DEFAULT_FORM = {
    eventTypeId: "",
    description: "",
    allDay: false,
    isFreeDay: false,
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
};

export const useCasaForm = ({
    name,
    isOpen,
    onClose,
    onSuccess,
    initialStartDate,
    initialEndDate,
    onNameError,
    onValidationAlert,
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

    useEffect(() => {
        if (!isOpen) {
            setForm(DEFAULT_FORM);
            setErrors({});
            setServerError(null);
            onValidationAlert?.(null);

            setOverlapState({
                show: false,
                collisions: [],
                pendingPayload: null,
                isForcing: false,
            });

            return;
        }

        if (initialStartDate || initialEndDate) {
            setForm((prev) => ({
                ...prev,
                startDate: initialStartDate ?? prev.startDate,
                endDate: initialEndDate ?? prev.endDate,
            }));
        }
    }, [isOpen, initialStartDate, initialEndDate, onValidationAlert]);

    const setField = useCallback((field, value) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));

        setErrors((prev) => ({
            ...prev,
            [field]: undefined,
        }));
    }, []);

    const validate = () => {
        const input = {
            ...form,
            name: name?.trim() ?? "",
            categoryKey: "casa",
            forceOverlap: false,
        };

        const result = houseEventSchema.safeParse(input);

        if (result.success) {
            setErrors({});
            return result.data;
        }

        const fieldErrors = {};

        result.error.issues.forEach((error) => {
            const key = error.path[error.path.length - 1];

            if (key) {
                fieldErrors[key] = error.message;
            }
        });

        setErrors(fieldErrors);
        onNameError?.(fieldErrors.name ?? "");

        const messages = [
            ...new Set(result.error.issues.map((error) => error.message)),
        ].join("\n");

        onValidationAlert?.(messages);

        return null;
    };

    const submitPayload = async (payload) => {
        setIsSubmitting(true);

        try {
            const response = await createHouseEvent(payload);

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
            buildPayload({
                ...validated,
                forceOverlap: false,
            }),
        );
    };

    const handleForceOverlap = async () => {
        setOverlapState((prev) => ({
            ...prev,
            isForcing: true,
        }));

        try {
            const response = await createHouseEvent({
                ...overlapState.pendingPayload,
                forceOverlap: true,
            });

            onSuccess?.(response.data);
            onClose();
        } catch (err) {
            setOverlapState({
                show: false,
                collisions: [],
                pendingPayload: null,
                isForcing: false,
            });

            setServerError(err.message ?? "Error al forzar el registro");
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
