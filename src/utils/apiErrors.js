export const buildApiError = (response, data, fallbackMessage) => {
    const errorMessage = new Error(data?.message || fallbackMessage);
    errorMessage.status = response.status;
    errorMessage.code = data?.code;
    errorMessage.blockedUntil = data?.blockedUntil;
    errorMessage.data = data?.data;
    errorMessage.errors = Array.isArray(data?.errors) ? data.errors : [];
    return errorMessage;
};

export const getReadableErrors = (err) => {
    if (Array.isArray(err?.errors) && err.errors.length > 0) {
        return err.errors.map((item) => item.message);
    }

    return [err?.message || "Ocurrió un error inesperado"];
};