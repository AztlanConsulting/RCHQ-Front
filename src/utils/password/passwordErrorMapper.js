export const mapPasswordApiError = (err, mode = "self-service") => {
    const code = err?.code;

    if (code === "INVALID_CURRENT_PASSWORD") {
        return ["La contraseña actual es incorrecta"];
    }

    if (code === "PASSWORD_REUSE") {
        return [
            mode === "first-login"
                ? "La nueva contraseña debe ser diferente a la temporal"
                : "La nueva contraseña debe ser diferente a la actual",
        ];
    }

    if (code === "USER_NOT_AUTHENTICATED") {
        return [
            mode === "first-login"
                ? "Tu sesión de primer inicio ya no es válida. Vuelve a iniciar sesión."
                : "Tu sesión ya no es válida. Vuelve a iniciar sesión.",
        ];
    }

    if (code === "EMPLOYEE_NOT_FOUND") {
        return ["No se encontró el usuario."];
    }

    if (code === "ACCESS_NOT_ALLOWED") {
        return ["No tienes permiso para realizar esta acción."];
    }

    if (code === "FIRST_LOGIN_ALREADY_COMPLETED") {
        return ["Este cambio de contraseña de primer inicio ya no es requerido."];
    }

    return [err?.message || "Ocurrió un error inesperado"];
};