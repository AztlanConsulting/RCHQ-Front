import { useCallback, useEffect, useMemo, useState } from "react";
import {
    getVacationEmployees,
    getRemainingVacations,
    registerEmployeeVacation,
} from "../../services/vacationService";

const EMPTY_FORM = {
    employeeId: "",
    startDate: "",
    endDate: "",
};

const toDateInputValue = (value) => {
    if (!value) return "";

    return String(value).split("T")[0];
};

const normalizeEmployeeOption = (employee) => {
    const id =
        employee.employeeId ??
        employee.employee_id ??
        employee.id ??
        "";

    const name = employee.fullName
        ?? [employee.name, employee.surname].filter(Boolean).join(" ")
        ?? "Empleado sin nombre";

    return {
        value: id,
        label: name,
        employee,
    };
};

const isInvalidDateRange = (startDate, endDate) => {
    if (!startDate || !endDate) return false;

    return startDate > endDate;
};

export const useVacationForm = ({
    isOpen,
    onClose,
    onSuccess,
    onFeedback,
    initialStartDate,
    initialEndDate,
    onValidationAlert,
}) => {
    const [form, setForm] = useState(EMPTY_FORM);
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState("");
    const [employees, setEmployees] = useState([]);
    const [isLoadingOptions, setIsLoadingOptions] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [remainingInfo, setRemainingInfo] = useState(null);
    const [isLoadingRemaining, setIsLoadingRemaining] = useState(false);

    const employeeOptions = useMemo(
        () => employees.map(normalizeEmployeeOption).filter((option) => option.value),
        [employees],
    );

    const setField = useCallback((field, value) => {
        setForm((current) => ({
            ...current,
            [field]: value,
        }));

        setErrors((current) => ({
            ...current,
            [field]: "",
        }));

        setServerError("");
        onValidationAlert?.(null);
    }, [onValidationAlert]);

    useEffect(() => {
        if (!isOpen) {
            setForm(EMPTY_FORM);
            setErrors({});
            setServerError("");
            setEmployees([]);
            setRemainingInfo(null);
            setIsSubmitting(false);
            setIsLoadingOptions(false);
            setIsLoadingRemaining(false);
            return;
        }

        setForm({
            employeeId: "",
            startDate: toDateInputValue(initialStartDate),
            endDate: toDateInputValue(initialEndDate),
        });

        const loadEmployees = async () => {
            setIsLoadingOptions(true);
            setServerError("");

            try {
                const result = await getVacationEmployees();
                setEmployees(result);
            } catch (err) {
                setServerError(
                    err.message || "No se pudieron cargar los empleados",
                );
            } finally {
                setIsLoadingOptions(false);
            }
        };

        loadEmployees();
    }, [isOpen, initialStartDate, initialEndDate]);

    useEffect(() => {
        if (!form.employeeId) {
            setRemainingInfo(null);
            return;
        }

        const loadRemainingVacations = async () => {
            setIsLoadingRemaining(true);

            try {
                const result = await getRemainingVacations(form.employeeId);
                setRemainingInfo(result);
            } catch {
                setRemainingInfo(null);
            } finally {
                setIsLoadingRemaining(false);
            }
        };

        loadRemainingVacations();
    }, [form.employeeId]);

    const validate = () => {
        const nextErrors = {};

        if (!form.employeeId) {
            nextErrors.employeeId = "Selecciona un empleado";
        }

        if (!form.startDate) {
            nextErrors.startDate = "Selecciona la fecha de inicio";
        }

        if (!form.endDate) {
            nextErrors.endDate = "Selecciona la fecha de fin";
        }

        if (isInvalidDateRange(form.startDate, form.endDate)) {
            nextErrors.endDate =
                "La fecha de inicio no puede ser posterior a la fecha de fin";
        }

        setErrors(nextErrors);

        return Object.keys(nextErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (isSubmitting) return;

        setServerError("");
        onValidationAlert?.(null);

        if (!validate()) {
            onValidationAlert?.("Revisa los campos marcados antes de continuar");
            return;
        }

        setIsSubmitting(true);

        try {
            await registerEmployeeVacation({
                employeeId: form.employeeId,
                startDate: form.startDate,
                endDate: form.endDate,
            });

            onFeedback?.({
                type: "success",
                message: "Vacaciones registradas correctamente",
            });

            await onSuccess?.();
            onClose?.();
        } catch (err) {
            setServerError(
                err.message || "No se pudieron registrar las vacaciones",
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        form,
        errors,
        serverError,
        employeeOptions,
        isLoadingOptions,
        isSubmitting,
        remainingInfo,
        isLoadingRemaining,
        setField,
        setServerError,
        handleSubmit,
    };
};
