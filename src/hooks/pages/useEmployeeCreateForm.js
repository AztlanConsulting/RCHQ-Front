import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    getEmployeeFormData,
    createEmployee,
} from "../../services/personalService";
import { employeeCreateSchema } from "../../utils/schema/employee/employeeAdd.schema";

const INITIAL_FORM = {
    roleId: "",
    name: "",
    surname: "",
    email: "",
    curp: "",
    rfc: "",
    nss: "",
    bankAccount: "",
    birthDate: "",
    startDate: "",
};

const useEmployeeCreateForm = (onSuccess) => {
    const navigate = useNavigate();

    const [roles, setRoles] = useState([]);
    const [photo, setPhoto] = useState(null);
    const [form, setForm] = useState(INITIAL_FORM);
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [showScheduleReminder, setShowScheduleReminder] = useState(false);
    const [createdEmployeeName, setCreatedEmployeeName] = useState("");
    const [pendingRedirect, setPendingRedirect] = useState(null);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await getEmployeeFormData();
                setRoles(data.roles ?? []);
            } catch (err) {
                setServerError("Error cargando datos iniciales");
            } finally {
                setIsLoadingData(false);
            }
        };

        load();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setErrors((prev) => {
            if (!prev[name]) return prev;
            const next = { ...prev };
            delete next[name];
            return next;
        });
        let finalValue = value;

        switch (name) {
            case "name":
            case "surname":
                finalValue = value.replace(/[^a-zA-ZÁÉÍÓÚáéíóúÑñ\s]/g, "");
                break;

            case "nss":
            case "bankAccount":
                finalValue = value.replace(/\D/g, "");
                break;

            case "curp":
            case "rfc":
                finalValue = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
                break;

            case "email":
                finalValue = value.replace(/[^a-zA-Z0-9@._+-]/g, "");
                break;

            default:
                finalValue = value;
        }

        setForm((prev) => ({
            ...prev,
            [name]: finalValue,
        }));
    };

    const handleSubmit = async () => {
        setErrors({});
        setServerError(null);

        const result = employeeCreateSchema.safeParse(form);

        if (!result.success) {
            const fieldErrors = {};
            result.error.issues.forEach((issue) => {
                const field = issue.path[0];
                if (field && !fieldErrors[field]) {
                    fieldErrors[field] = issue.message;
                }
            });
            setErrors(fieldErrors);
            setServerError(result.error.issues[0].message);
            return;
        }

        setIsLoading(true);

        try {
            const payload = {
                ...result.data,
                picture: photo,
            };

            const response = await createEmployee(payload);

            const employeeName = `${result.data.name} ${result.data.surname}`.trim();
            const redirectPath = response.redirect || "/app/personal";

            setForm(INITIAL_FORM);
            setPhoto(null);
            onSuccess?.();
            setCreatedEmployeeName(employeeName);
            setPendingRedirect(redirectPath);
            setShowScheduleReminder(true);
        } catch (err) {
            setServerError(err.message);

            if (err.redirect) {
                setTimeout(() => {
                    navigate(err.redirect);
                }, 3000);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleScheduleReminderConfirm = () => {
        setShowScheduleReminder(false);
        navigate(pendingRedirect || "/app/personal");
    };

    return {
        form,
        roles,
        photo,
        errors,
        serverError,
        isLoading,
        isLoadingData,
        showScheduleReminder,
        createdEmployeeName,
        handleScheduleReminderConfirm,
        setServerError,
        setPhoto,
        handleChange,
        handleSubmit,
        navigate,
    };
};

export default useEmployeeCreateForm;
