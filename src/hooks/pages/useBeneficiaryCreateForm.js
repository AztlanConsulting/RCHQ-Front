import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createBeneficiary } from "../../services/beneficiaryService";
import { beneficiaryCreateSchema } from "../../utils/schema/beneficiary/beneficiaryAdd.schema";

const INITIAL_FORM = {
    name: "",
    maternal_surname: "",
    paternal_surname: "",
    preferred_name: "",
    birth_date: "",
    age_entered_house: "",
    blood_type: "",
    curp: "",
};

const useBeneficiaryCreateForm = (onSuccess) => {
    const navigate = useNavigate();

    const [form, setForm] = useState(INITIAL_FORM);
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

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
            case "maternal_surname":
            case "paternal_surname":
            case "preferred_name":
                finalValue = value.replace(/[^a-zA-ZÁÉÍÓÚáéíóúÑñ\s]/g, "");
                break;

            case "curp":
                finalValue = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
                break;

            case "age_entered_house":
                finalValue = value.replace(/\D/g, "");
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

        const result = beneficiaryCreateSchema.safeParse(form);

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
            const response = await createBeneficiary(result.data);

            setForm(INITIAL_FORM);
            onSuccess?.();

            if (response.redirect) {
                navigate(response.redirect);
            } else {
                navigate("/app/beneficiarios");
            }
        } catch (err) {
            setServerError(err.message);
            if (err.fieldErrors) {
                setErrors(err.fieldErrors);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return {
        form,
        errors,
        serverError,
        isLoading,
        setServerError,
        handleChange,
        handleSubmit,
        navigate,
    };
};

export default useBeneficiaryCreateForm;
