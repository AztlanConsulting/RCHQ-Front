import { getToken } from "../utils/authStorage";
import { buildApiError } from "../utils/apiErrors";
import { secureFetch } from "@/utils/secureFetchWrapper";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const getUpdateFormService = async () => {
    const token = getToken();
    if (!token) throw new Error("No se encontró token de sesión");
    const response = await secureFetch(`${API_URL}/employee/update-form`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok)
        throw buildApiError(response, data, "Error al obtener catálogos");
    return data;
};

export const updateBasicInfoService = async (employeeId, body) => {
    const token = getToken();
    if (!token) throw new Error("No se encontró token de sesión");
    const response = await secureFetch(
        `${API_URL}/employee/${employeeId}/basic-info`,
        {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        },
    );
    const data = await response.json();
    if (!response.ok)
        throw buildApiError(
            response,
            data,
            "Error al actualizar información básica",
        );
    return data;
};

export const updateContactInfoService = async (employeeId, body) => {
    const token = getToken();
    if (!token) throw new Error("No se encontró token de sesión");
    const response = await secureFetch(
        `${API_URL}/employee/${employeeId}/contact-info`,
        {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        },
    );
    const data = await response.json();
    if (!response.ok)
        throw buildApiError(
            response,
            data,
            "Error al actualizar información de contacto",
        );
    return data;
};

export const updateAdminInfoService = async (employeeId, body) => {
    const token = getToken();
    if (!token) throw new Error("No se encontró token de sesión");
    const response = await secureFetch(
        `${API_URL}/employee/${employeeId}/admin-info`,
        {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        },
    );
    const data = await response.json();
    if (!response.ok)
        throw buildApiError(
            response,
            data,
            "Error al actualizar información administrativa",
        );
    return data;
};
