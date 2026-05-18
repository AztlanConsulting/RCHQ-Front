import { useCallback, useEffect, useRef, useState } from "react";

import {
    createAbsenceService,
    getAbsenceAddData,
} from "../../services/calendarService";
import { useDocumentFile } from "../atoms/useDocumentFile";

const DEFAULT_FORM = {
    employeeId: "",
    absenceTypeId: "",
    startDate: "",
    endDate: "",
    description: "",
};

const DATE_FORMAT = /^\d{4}-\d{2}-\d{2}$/;
const DESCRIPTION_PATTERN = /^[\p{L}\p{N}\s¿?¡!,.\-+#"_]+$/u;

const sanitizeDescription = (value = "") =>
    String(value)
        .replace(/[^\p{L}\p{N}\s¿?¡!,.\-+#"_]/gu, "")
        .slice(0, 200);

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

    return (
        detailedErrors[0] ||
        error?.message ||
        "No se pudo registrar la ausencia"
    );
};

export const useAbsenceForm = ({
    isOpen,
    onClose,
    onSuccess,
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
    } = useDocumentFile();

    useEffect(() => {
        if (!isOpen) return;

        let isEffectActive  = true;

        getAbsenceAddData()
            .then(({ employees = [], absenceTypes = [] }) => {
                if (!isEffectActive ) return;

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
                if (!isEffectActive ) return;
                setServerError(
                    error?.message ||
                        "No se pudieron cargar los datos de ausencias",
                );
            })
            .finally(() => {
                if (isEffectActive ) {
                    setIsLoadingOptions(false);
                }
            });

        return () => {
            isEffectActive  = false;
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
            const nextValue =
                field === "description" ? sanitizeDescription(value) : value;

            setForm((prev) => ({
                ...prev,
                [field]: nextValue,
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
        const fieldErrors = {};
        const description = sanitizeDescription(form.description).trim();

        if (!form.employeeId) {
            fieldErrors.employeeId = "Selecciona un empleado.";
        }

        if (!form.absenceTypeId) {
            fieldErrors.absenceTypeId = "Selecciona un tipo de ausencia.";
        }

        if (!DATE_FORMAT.test(form.startDate)) {
            fieldErrors.startDate = "Fecha de inicio inválida.";
        } else if (form.startDate < dateLimits.minStartDateValue) {
            fieldErrors.startDate =
                "Fecha de inicio no puede ser menor a un mes antes del día actual.";
        }

        if (!DATE_FORMAT.test(form.endDate)) {
            fieldErrors.endDate = "Fecha de fin inválida.";
        } else if (form.endDate > dateLimits.maxEndDateValue) {
            fieldErrors.endDate = "Fecha de fin no puede ser mayor a un año.";
        }

        if (
            !fieldErrors.startDate &&
            !fieldErrors.endDate &&
            form.endDate < form.startDate
        ) {
            fieldErrors.endDate =
                "La fecha de fin no puede ser menor a la fecha de inicio.";
        }

        if (!description) {
            fieldErrors.description = "La descripción es obligatoria.";
        } else if (!DESCRIPTION_PATTERN.test(description)) {
            fieldErrors.description =
                "La descripción contiene caracteres no permitidos.";
        }

        if (evidenceError) {
            fieldErrors.file = evidenceError;
        }

        setErrors(fieldErrors);

        const messages = Object.values(fieldErrors).filter(Boolean);
        onValidationAlert?.(
            messages.length > 0 ? [...new Set(messages)].join("\n") : null,
        );

        if (messages.length > 0) return null;

        return {
            ...form,
            description,
        };
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
            onSuccess?.(absence);
            onClose?.();
        } catch (error) {
            setServerError(getSubmitErrorMessage(error));
        } finally {
            setIsSubmitting(false);
        }
    }, [evidenceFile, onClose, onSuccess, resetEvidence, validate]);

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
