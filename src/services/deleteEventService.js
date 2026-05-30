import { buildApiError } from "../utils/apiErrors";
import { secureFetch } from "../utils/secureFetchWrapper";

export const deleteHouseEvent = async (houseEventId) => {
    const rawResponse = await secureFetch(
        `/event/house/${houseEventId}`,
        {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        },
    );

    const response = await rawResponse.json().catch(() => ({}));

    if (!rawResponse.ok) {
        throw buildApiError(
            rawResponse,
            response,
            "No se pudo eliminar el evento de casa",
        );
    }

    return response;
};

export const deletePersonalEvent = async (personalEventId) => {
    const rawResponse = await secureFetch(
        `/event/personal/${personalEventId}`,
        {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        },
    );

    const response = await rawResponse.json().catch(() => ({}));

    if (!rawResponse.ok) {
        throw buildApiError(
            rawResponse,
            response,
            "No se pudo eliminar el evento de personal",
        );
    }

    return response;
};
