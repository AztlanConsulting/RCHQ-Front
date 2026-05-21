import { buildApiError } from "../utils/apiErrors";
import AuthUtils from "../utils/auth.utils";
import { secureFetch } from "../utils/secureFetchWrapper";

const API_URL = import.meta.env.VITE_API_URL;

export const deleteHouseEvent = async (houseEventId) => {
    const token = getToken();

    if (!token) {
        throw new Error("No se encontró token de sesión");
    }

    const rawResponse = await secureFetch(
        `${API_URL}/event/house/${houseEventId}`,
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
            "No se pudo eliminar el evento de casa",
        );
    }

    return response;
};
