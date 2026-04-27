import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    getEmployeeFormData,
    createEmployee,
} from "../../Services/PersonalService";
import { employeeCreateSchema } from "../../utils/Schema/Employee/employeeAdd.schema";

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
};

const useEmployeeCreateForm = (onSuccess) => {
    const navigate = useNavigate();

    const [roles, setRoles] = useState([]);
    const [photo, setPhoto] = useState(null);
    const [form, setForm] = useState(INITIAL_FORM);
    const [errors, setErrors] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await getEmployeeFormData();
                setRoles(data.roles ?? []);
            } catch (err) {
                setErrors("Error cargando datos iniciales");
            } finally {
                setIsLoadingData(false);
            }
        };

        load();
    }, []);

    const handleChange = (e) => {
        setErrors(null);

        const { name, value } = e.target;
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
        setErrors(null);

        const result = employeeCreateSchema.safeParse(form);

        if (!result.success) {
            setErrors(result.error.issues[0].message);
            return;
        }

        setIsLoading(true);

        try {
            const payload = {
                ...result.data,
                picture: photo,
            };

            const response = await createEmployee(payload);

            setForm(INITIAL_FORM);
            setPhoto(null);

            onSuccess?.();

            if (response.redirect) {
                navigate(response.redirect);
            } else {
                navigate("/empleados");
            }
        } catch (err) {
            setErrors(err.message);

            if (err.redirect) {
                setTimeout(() => {
                    navigate(err.redirect);
                }, 3000);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return {
        form,
        roles,
        photo,
        errors,
        isLoading,
        isLoadingData,
        setErrors,
        setPhoto,
        handleChange,
        handleSubmit,
        navigate,
    };
};

export default useEmployeeCreateForm;
