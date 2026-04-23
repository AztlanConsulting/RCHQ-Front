import {
    getToken,
    getFirstLoginToken,
    setToken,
    setStoredUser,
    removeFirstLoginToken,
} from "../utils/authStorage";

import { buildApiError } from "../utils/apiErrors";

const API_URL = "http://localhost:3000";

const changePasswordFirstLoginService = async (
    newPassword,
    confirmPassword,
) => {
    const token = getFirstLoginToken();

    if (!token) {
        throw new Error("No se encontró token de primer inicio de sesión");
    }

    const response = await fetch(`${API_URL}/users/first-login/change-password`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newPassword, confirmPassword }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw buildApiError(
            response,
            data,
            "Error al cambiar la contraseña de primer inicio de sesión",
        );
    }

    removeFirstLoginToken();

    const sessionToken = data?.data?.token;
    const user = data?.data?.user;

    if (sessionToken) {
        setToken(sessionToken);
    }
    if (user) {
        setStoredUser(user);
    }

    return data;
};

const changePasswordService = async (
    currentPassword,
    newPassword,
    confirmPassword,
) => {
    const token = getToken();

    if (!token) {
        throw new Error("No se encontró token de sesión");
    }

    const response = await fetch(`${API_URL}/users/change-password`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw buildApiError(response, data, "Error al cambiar la contraseña");
    }

    return data;
};

export {
    changePasswordFirstLoginService,
    changePasswordService,
};