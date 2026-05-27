import { useCallback, useEffect, useMemo, useState } from "react";
import { getCalendarViewerRole, getOwnEmployeeId } from "../../services/calendarService";
import {
    getVacationEmployees,
    getRemainingVacations,
    registerEmployeeVacation,
    requestEmployeeVacation,
} from "../../services/vacationService";
import { shiftDateOnlyRange } from "../../utils/dateRangeShift";
import { getVacationFormErrors } from "../../utils/schema/vacation/vacation.schema";

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

    const name =
        employee.fullName ??
        employee.name ??
        [employee.name, employee.surname].filter(Boolean).join(" ") ??
        "Empleado sin nombre";

    return {
        value: id,
        label: name,
        employee,
    };
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

    const viewerRole = getCalendarViewerRole();
    const ownEmployeeId = getOwnEmployeeId();

    const setField = useCallback(
        (field, value) => {
            setForm((current) =>
                field === "startDate"
                    ? shiftDateOnlyRange(current, value)
                    : {
                        ...current,
                        [field]: value,
                    },
            );

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
            employeeId: viewerRole !== "Coordinador" ? ownEmployeeId : "",
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

        if (viewerRole === "Coordinador") loadEmployees();
    }, [isOpen, initialStartDate, initialEndDate, viewerRole, ownEmployeeId]);

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

    const handleSubmit = async () => {
        if (isSubmitting) return;

        setServerError("");
        onValidationAlert?.(null);

        const validation = getVacationFormErrors(form);

        if (!validation.success) {
            setErrors(validation.errors);
            onValidationAlert?.("Revisa los campos marcados antes de continuar");
            return;
        }

        setErrors({});
        setIsSubmitting(true);

        try {
            if (viewerRole !== "Coordinador") await requestEmployeeVacation(validation.data);
            else await registerEmployeeVacation(validation.data);

            onFeedback?.({
                type: "success",
                message: `Vacaciones ${viewerRole === "Coordinador" ? "registradas" : "solicitadas"} correctamente`,
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
