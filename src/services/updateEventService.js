import { buildApiError } from "../utils/apiErrors";
import { secureFetch } from "../utils/secureFetchWrapper";

const API_URL = import.meta.env.VITE_API_URL;

export const updatePersonalEvent = async (personalEventId, payload) => {
    const rawResponse = await secureFetch(
        `${API_URL}/event/personal/${personalEventId}`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        },
    );

    const response = await rawResponse.json().catch(() => ({}));

    if (!rawResponse.ok && rawResponse.status !== 409) {
        throw buildApiError(
            rawResponse,
            response,
            "No se pudo modificar el evento personal",
        );
    }

    return response;
};

export const updateHouseEvent = async (houseEventId, payload) => {
    const rawResponse = await secureFetch(
        `${API_URL}/event/house/${houseEventId}`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        },
    );

    const response = await rawResponse.json().catch(() => ({}));

    if (!rawResponse.ok && rawResponse.status !== 409) {
        throw buildApiError(
            rawResponse,
            response,
            "No se pudo modificar el evento de casa",
        );
    }

    return response;
};
