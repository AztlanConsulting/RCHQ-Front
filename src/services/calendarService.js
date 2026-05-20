import AuthUtils from "../utils/auth.utils";
import { buildApiError } from "../utils/apiErrors";
import { secureFetch } from "../utils/secureFetchWrapper";
import CalendarUtils from "../utils/calendar.utils";

const API_URL = import.meta.env.VITE_API_URL;

class CalendarService  {
    static getEventsTypes = async () => {
        const token = AuthUtils.getToken();
    
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
    };

    static getEventsTypes = async () => {
        const token = AuthUtils.getToken();
    
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
    };

    static getAbsenceTypes = async () => {
        const token = AuthUtils.getToken();
    
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

    static getAbsenceAddData = async () => {
        const token = AuthUtils.getToken();
    
        if (!token) {
            throw new Error("No se encontró token de sesión");
        }
    
        const rawResponse = await secureFetch(`${API_URL}/absence/add`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });
    
        const response = await rawResponse.json().catch(() => ({}));
        if (!rawResponse.ok) {
            throw buildApiError(
                rawResponse,
                response,
                "No se pudieron obtener los datos para registrar ausencias",
            );
        }
    
        return {
            employees: response?.data?.employees ?? [],
            absenceTypes: response?.data?.absenceTypes ?? [],
        };
    };

    static getHouseEmployees = async () => {
        const token = AuthUtils.getToken();
    
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

    static getEventsInRange = async (employeeId, startDate, endDate) => {

        if (employeeId == "") {
            return [];
        }
    
        const token = AuthUtils.getToken();
    
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
        console.log("raw events: ", rawEvents);
    
        return Array.isArray(rawEvents) ? rawEvents.map(CalendarUtils.normalizeCalendarEvent) : [];
    };

    static getHouseEventsInRange = async (startDate, endDate) => {
        const token = AuthUtils.getToken();
    
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
    
        return Array.isArray(rawEvents) ? rawEvents.map(CalendarUtils.normalizeCalendarEvent) : [];
    };

    static createAbsenceService = async (employeeId, payload) => {
        const token = AuthUtils.getToken();
    
        if (!token) {
            throw new Error("No se encontró token de sesión");
        }
    
        const hasFile =
            typeof File !== "undefined" && payload?.file instanceof File;
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
            body = JSON.stringify({
                absenceTypeId: payload.absenceTypeId,
                startDate: payload.startDate,
                endDate: payload.endDate,
                description: payload.description,
            });
        }
    
        const rawResponse = await secureFetch(
            `${API_URL}/absence/${employeeId}/add`,
            {
                method: "POST",
                headers,
                body,
            },
        );
    
        const response = await rawResponse.json().catch(() => ({}));
    
        if (!rawResponse.ok) {
            throw buildApiError(
                rawResponse,
                {
                    ...response,
                    message: response?.message || response?.error,
                },
                "No se pudo registrar la ausencia",
            );
        }
    
        return response?.data?.absence;
    };

    static updateAbsenceService = async (absenceId, payload) => {
        const token = AuthUtils.getToken();
    
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

    static deleteAbsenceService = async (absenceId) => {
        const token = AuthUtils.getToken();
    
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

    static getEmployeeHouseName = async () => {
        const token = AuthUtils.getToken();
    
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
    };
};

export default CalendarService;
