import { getToken, getStoredUser } from "../utils/authStorage";
import { buildApiError } from "../utils/apiErrors";
import { secureFetch } from "../utils/secureFetchWrapper";

const API_URL = import.meta.env.VITE_API_URL;

const parseJwtPayload = (token) => {
    if (!token) return null;

    try {
        const [, payload] = token.split(".");
        if (!payload) return null;

        const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
        const padded = normalized.padEnd(
            normalized.length + ((4 - (normalized.length % 4)) % 4),
            "=",
        );
        const decoded = atob(padded);
        return JSON.parse(decoded);
    } catch {
        return null;
    }
};

export const getEventsTypes = async () => {
    const token = getToken();

    if (!token) {
        throw new Error("No se encontró token de sesión");
    }

    const rawResponse = await secureFetch(
        `${API_URL}/event/getAllTypes`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        },
    );

    const response = await rawResponse.json();
    if (!rawResponse.ok) {
        throw buildApiError(
            rawResponse,
            response,
            "No se pudieron obtener los tipos de evento",
        );
    }
    const eventTypes = response?.data?.eventTypes;

    return eventTypes;
}

export const getAbsenceTypes = async () => {
    const token = getToken();

    if (!token) {
        throw new Error("No se encontró token de sesión");
    }

    const rawResponse = await secureFetch(
        `${API_URL}/absence/types`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        },
    );

    const response = await rawResponse.json();
    if (!rawResponse.ok) {
        throw buildApiError(
            rawResponse,
            response,
            "No se pudieron obtener los tipos de ausencia",
        );
    }
    return response?.data?.absenceTypes ?? [];
};

export const getHouseEmployees = async () => {
    const token = getToken();

    if (!token) {
        throw new Error("No se encontró token de sesión");
    }

    const rawResponse = await secureFetch(
        `${API_URL}/house/employees`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        },
    );

    const response = await rawResponse.json();
    if (!rawResponse.ok) {
        throw buildApiError(
            rawResponse,
            response,
            "No se pudieron obtener los empleados de la casa",
        );
    }
    return response?.data?.employees ?? [];
};

const getEventsInRange = async (employeeId, startDate, endDate) => {

    if (employeeId == "") {
        return [];
    }

    const token = getToken();

    if (!token) {
        throw new Error("No se encontró token de sesión");
    }

    const rawResponse = await secureFetch(
        `${API_URL}/event/range/${employeeId}/${startDate}/${endDate}`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        },
    );

    const response = await rawResponse.json();
    if (!rawResponse.ok) {
        throw buildApiError(
            rawResponse,
            response,
            "No se pudieron obtener los eventos del calendario",
        );
    }
    const rawEvents = response.data.events;

    return rawEvents;
};

export const getHouseAbsencesInRange = async (startDate, endDate) => {
    const token = getToken();

    if (!token) {
        throw new Error("No se encontró token de sesión");
    }

    const rawResponse = await secureFetch(
        `${API_URL}/event/house/range/${startDate}/${endDate}`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        },
    );

    const response = await rawResponse.json();
    if (!rawResponse.ok) {
        throw buildApiError(
            rawResponse,
            response,
            "No se pudieron obtener las ausencias de la casa",
        );
    }
    return response?.data?.events ?? [];
};

export const updateAbsenceService = async (absenceId, payload) => {
    const token = getToken();

    if (!token) {
        throw new Error("No se encontró token de sesión");
    }

    const rawResponse = await secureFetch(
        `${API_URL}/absence/${absenceId}`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
        },
    );

    const response = await rawResponse.json().catch(() => ({}));

    if (!rawResponse.ok) {
        throw buildApiError(
            rawResponse,
            response,
            "No se pudo actualizar la ausencia",
        );
    }

    return response?.data?.absence;
};

const getOwnEmployeeId = () => {
    const userData = getStoredUser();
    const tokenPayload = parseJwtPayload(getToken());
    const employeeId = userData?.employeeId ?? tokenPayload?.id ?? "";
    return employeeId;
};

export const getCalendarViewerRole = () => {
    const userData = getStoredUser();
    const tokenPayload = parseJwtPayload(getToken());

    return userData?.role ?? userData?.roleName ?? tokenPayload?.role ?? "";
};

export const getEmployeeHouseName = async () => {
    const token = getToken();

    if (!token) {
        throw new Error("No se encontró token de sesión");
    }

    const rawResponse = await secureFetch(
        `${API_URL}/house/getHouseName`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        },
    );

    const response = await rawResponse.json();
    if (!rawResponse.ok) {
        throw buildApiError(
            rawResponse,
            response,
            "No se pudo obtener el nombre de la casa",
        );
    }
    const houseName = response?.data?.houseName;

    return houseName;
}

export { getEventsInRange, getOwnEmployeeId };
