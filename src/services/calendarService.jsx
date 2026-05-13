import { getToken, getStoredUser } from "../utils/authStorage";
import { secureFetch } from "../utils/secureFetchWrapper";

const API_URL = import.meta.env.VITE_API_URL;

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
    const eventTypes = response?.data?.eventTypes;

    return eventTypes;
}

const getEventsInRange = async (employeeId, startDate, endDate) => {

    if (employeeId == "") {
        return [];
    }

    const token = getToken();

    if (!token) {
        throw new Error("No se encontró token de sesión");
    }

    const rawResponse = await fetch(
        `${API_URL}/event/range/${employeeId}/${startDate}/${endDate}`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        },
    );

    if (rawResponse === undefined) return [];

    const response = await rawResponse.json();
    const rawEvents = response.data.events;

    return rawEvents;
};

const getOwnEmployeeId = () => {
    const userData = getStoredUser();
    const employeeId = userData.employeeId;
    return employeeId;
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
    const houseName = response?.data?.houseName;

    return houseName;
}

export { getEventsInRange, getOwnEmployeeId };
