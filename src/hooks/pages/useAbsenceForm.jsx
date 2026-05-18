import { useCallback, useEffect, useRef, useState } from "react";

import {
    createAbsenceService,
    getAbsenceAddData,
} from "../../services/calendarService";
import {
    buildAbsenceFormSchema,
    sanitizeAbsenceDescription,
} from "../../utils/schema/evento/absence.schema";
import { useDocumentFile } from "../atoms/useDocumentFile";

const DEFAULT_FORM = {
    employeeId: "",
    absenceTypeId: "",
    startDate: "",
    endDate: "",
    description: "",
};

const normalizeInitialDate = (value) =>
    value ? String(value).slice(0, 10) : "";

const toDateInputValue = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

const buildAbsenceDateLimits = () => {
    const today = new Date();
    const minStartDate = new Date(
        today.getFullYear(),
        today.getMonth() - 1,
        today.getDate(),
    );
    const maxEndDate = new Date(
        today.getFullYear() + 1,
        today.getMonth(),
        today.getDate(),
    );

    minStartDate.setHours(0, 0, 0, 0);
    maxEndDate.setHours(23, 59, 59, 999);

    return {
        minStartDate,
        maxEndDate,
        minStartDateValue: toDateInputValue(minStartDate),
        maxEndDateValue: toDateInputValue(maxEndDate),
    };
};

const getSubmitErrorMessage = (error) => {
    const detailedErrors = Array.isArray(error?.errors)
        ? error.errors
                .map((item) => item?.mensaje || item?.message)
                .filter(Boolean)
        : [];

    if (detailedErrors[0]) return detailedErrors[0];

    const message = error?.message || "";

    if (error?.status === 401) {
        return "Tu sesión expiró. Inicia sesión nuevamente.";
    }

    if (error?.status === 403) {
        return "Permisos insuficientes";
    }

    if (error?.status === 404) {
        if (message) return message;

        return "usuario no encontrado";
    }

    if (error?.status === 406) {
        return (
            message ||
            "No se pudo registrar la ausencia por un conflicto de fechas."
        );
    }

    if (error?.status === 422) {
        return message || "Revisa los datos de la ausencia.";
    }

    return message || "No se pudo registrar la ausencia";
};

export const useAbsenceForm = ({
    isOpen,
    onClose,
    onSuccess,
    onFeedback,
    initialStartDate,
    initialEndDate,
    onNameError,
    onValidationAlert,
}) => {
    const [form, setForm] = useState(() => ({
        ...DEFAULT_FORM,
        startDate: normalizeInitialDate(initialStartDate),
        endDate: normalizeInitialDate(initialEndDate),
    }));
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState(null);
    const [employeeOptions, setEmployeeOptions] = useState([]);
    const [absenceTypeOptions, setAbsenceTypeOptions] = useState([]);
    const [isLoadingOptions, setIsLoadingOptions] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [dateLimits] = useState(buildAbsenceDateLimits);
    const lastInitialDatesRef = useRef({
        startDate: normalizeInitialDate(initialStartDate),
        endDate: normalizeInitialDate(initialEndDate),
    });
    const {
        file: evidenceFile,
        fileName: evidenceFileName,
        error: evidenceError,
        handleFileChange: handleEvidenceChange,
        reset: resetEvidence,
    } = useDocumentFile({
        invalidTypeMessage: "Formato invalido de ausencias",
        maxSizeMessage: "tamaño superior a 10mb",
    });

    useEffect(() => {
        if (!isOpen) return;

        let isEffectActive = true;

        getAbsenceAddData()
            .then(({ employees = [], absenceTypes = [] }) => {
                if (!isEffectActive) return;

                setEmployeeOptions(
                    employees.map((employee) => ({
                        value: employee.employeeId,
                        label: employee.name,
                        houseId: employee.houseId,
                        picture: employee.picture ?? "",
                    })),
                );

                setAbsenceTypeOptions(
                    absenceTypes.map((absenceType) => ({
                        value: absenceType.absenceTypeId,
                        label: absenceType.name,
                    })),
                );
            })
            .catch((error) => {
                if (!isEffectActive) return;
                setServerError(
                    error?.message ||
                        "No se pudieron cargar los datos de ausencias",
                );
            })
            .finally(() => {
                if (isEffectActive) {
                    setIsLoadingOptions(false);
                }
            });

        return () => {
            isEffectActive = false;
        };
    }, [isOpen]);

    useEffect(() => {
        const nextInitialDates = {
            startDate: normalizeInitialDate(initialStartDate),
            endDate: normalizeInitialDate(initialEndDate),
        };
        const previousInitialDates = lastInitialDatesRef.current;

        if (
            nextInitialDates.startDate === previousInitialDates.startDate &&
            nextInitialDates.endDate === previousInitialDates.endDate
        ) {
            return;
        }

        lastInitialDatesRef.current = nextInitialDates;

        setForm((prev) => ({
            ...prev,
            startDate:
                !prev.startDate ||
                prev.startDate === previousInitialDates.startDate
                    ? nextInitialDates.startDate
                    : prev.startDate,
            endDate:
                !prev.endDate || prev.endDate === previousInitialDates.endDate
                    ? nextInitialDates.endDate
                    : prev.endDate,
        }));
    }, [initialEndDate, initialStartDate]);

    const setField = useCallback(
        (field, value) => {
            setForm((prev) => ({
                ...prev,
                [field]:
                    field === "description"
                        ? sanitizeAbsenceDescription(value, prev.description)
                        : value,
            }));

            setErrors((prev) => ({
                ...prev,
                [field]: undefined,
            }));

            onNameError?.("");
            onValidationAlert?.(null);
        },
        [onNameError, onValidationAlert],
    );

    const validate = useCallback(() => {
        const schema = buildAbsenceFormSchema(dateLimits);
        const result = schema.safeParse(form);
        const fieldErrors = {};

        if (evidenceError) {
            fieldErrors.file = evidenceError;
        }

        if (!result.success) {
            result.error.issues.forEach((issue) => {
                const key = issue.path[issue.path.length - 1];

                if (key && !fieldErrors[key]) {
                    fieldErrors[key] = issue.message;
                }
            });
        }

        setErrors(fieldErrors);

        const messages = Object.values(fieldErrors).filter(Boolean);
        onValidationAlert?.(
            messages.length > 0 ? [...new Set(messages)].join("\n") : null,
        );

        if (messages.length > 0) return null;

        return result.data;
    }, [dateLimits, evidenceError, form, onValidationAlert]);

    const handleSubmit = useCallback(async () => {
        const validated = validate();

        if (!validated) return;

        setIsSubmitting(true);
        setServerError(null);

        try {
            const absence = await createAbsenceService(validated.employeeId, {
                absenceTypeId: validated.absenceTypeId,
                startDate: validated.startDate,
                endDate: validated.endDate,
                description: validated.description,
                file: evidenceFile || undefined,
            });

            resetEvidence();
            onFeedback?.({
                type: "success",
                message: "Ausencia registrada correctamente",
            });
            onSuccess?.(absence);
            onClose?.();
        } catch (error) {
            setServerError(getSubmitErrorMessage(error));
        } finally {
            setIsSubmitting(false);
        }
    }, [evidenceFile, onClose, onFeedback, onSuccess, resetEvidence, validate]);

    return {
        form,
        errors,
        serverError,
        employeeOptions,
        absenceTypeOptions,
        isLoadingOptions,
        isSubmitting,
        evidenceFileName,
        evidenceError,
        minStartDate: dateLimits.minStartDate,
        maxEndDate: dateLimits.maxEndDate,
        setField,
        setServerError,
        handleEvidenceChange,
        handleSubmit,
    };
};
