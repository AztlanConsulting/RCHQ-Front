import { secureFetch } from "../utils/secureFetchWrapper";

const mapValidationErrors = (errors) => {
    if (!Array.isArray(errors)) return null;

    const fieldErrors = {};
    errors.forEach((entry) => {
        const field = entry.path ?? entry.campo;
        const message = entry.message ?? entry.mensaje;
        if (field && message && !fieldErrors[field]) {
            fieldErrors[field] = message;
        }
    });

    return Object.keys(fieldErrors).length > 0 ? fieldErrors : null;
};

export const createBeneficiary = async (data) => {
    const res = await secureFetch("/beneficiary/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });

    const response = await res.json();

    if (!res.ok) {
        const error = new Error(
            response.message || "Error al registrar el beneficiario",
        );

        error.status = res.status;
        error.isAlreadyRegistered = res.status === 406;

        const fieldErrors = mapValidationErrors(response.errors);
        if (fieldErrors) {
            error.fieldErrors = fieldErrors;
        }

        if (response.data) {
            error.data = response.data;
        }

        throw error;
    }

    return response;
};
