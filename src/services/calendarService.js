import { getToken, getStoredUser } from "../utils/authStorage";
import { buildApiError } from "../utils/apiErrors";
import { secureFetch } from "../utils/secureFetchWrapper";
import { shiftCalendarApiInstantForFullCalendar } from "../utils/dates";

const API_URL = import.meta.env.VITE_API_URL;

const normalizeCalendarEvent = (event) => {
    const isAbsence = event?.focus === "ausencias" || event?.absenceId;
    const evidencePath = isAbsence ? event?.link || event?.url || "" : "";

    const base = {
        ...event,
        link: evidencePath
            ? `${API_URL}/${String(evidencePath).replace(/^\/+/, "")}`
            : "",
    };

    if (!event?.lastsAllDay) {
        return {
            ...base,
            start:
                base.start != null
                    ? shiftCalendarApiInstantForFullCalendar(base.start)
                    : base.start,
            end:
                base.end != null
                    ? shiftCalendarApiInstantForFullCalendar(base.end)
                    : base.end,
        };
    }

    return base;
};

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
    const rawEvents = response?.data?.events ?? [];

    return Array.isArray(rawEvents) ? rawEvents.map(normalizeCalendarEvent) : [];
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
    const rawEvents = response?.data?.events ?? [];

    return Array.isArray(rawEvents) ? rawEvents.map(normalizeCalendarEvent) : [];
};

export const updateAbsenceService = async (absenceId, payload) => {
    const token = getToken();

    if (!token) {
        throw new Error("No se encontró token de sesión");
    }

    const hasFile = payload?.file instanceof File;

    let headers = {
        Authorization: `Bearer ${token}`,
    };
    let body;

    if (hasFile) {
        const formData = new FormData();

        Object.entries(payload ?? {}).forEach(([key, value]) => {
            if (key === "file") return;
            if (value === undefined || value === null) return;
            formData.append(key, value);
        });

        formData.append("file", payload.file);
        body = formData;
    } else {
        headers = {
            ...headers,
            "Content-Type": "application/json",
        };
        body = JSON.stringify(payload);
    }

    const rawResponse = await secureFetch(
        `${API_URL}/absence/${absenceId}`,
        {
            method: "PUT",
            headers,
            body,
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

export const buildAbsenceEvidenceUrl = (link) => {
    if (!link) return "";

    if (/^https?:\/\//i.test(link)) {
        return link;
    }

    const baseUrl = String(API_URL ?? "").replace(/\/+$/, "");
    const normalizedLink = String(link).replace(/^\/+/, "");

    return `${baseUrl}/${normalizedLink}`;
};

export const deleteAbsenceService = async (absenceId) => {
    const token = getToken();

    if (!token) {
        throw new Error("No se encontró token de sesión");
    }

    const rawResponse = await secureFetch(
        `${API_URL}/absence/${absenceId}`,
        {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        },
    );

    const response = await rawResponse.json().catch(() => ({}));

    if (!rawResponse.ok) {
        throw buildApiError(
            rawResponse,
            response,
            "No se pudo eliminar la ausencia",
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
