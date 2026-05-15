const BASE_URL = import.meta.env.VITE_API_URL;

export async function createHouseEvent(payload) {
    const token = getAuthToken();

    const response = await fetch(`${BASE_URL}/event/house/add`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
    });

    const json = await response.json();

    if (!response.ok && response.status !== 409) {
        throw new APIError(
            json?.message ?? "Error al registrar el evento",
            response.status,
            json,
        );
    }

    return json;
}

export async function getEventTypes() {
    const token = getAuthToken();

    const response = await fetch(`${BASE_URL}/event/getAllTypes`, {
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });

    if (!response.ok) {
        throw new APIError("Error al cargar tipos de evento", response.status);
    }

    const json = await response.json();
    return json?.data?.eventTypes ?? [];
}

function getAuthToken() {
    return (
        localStorage.getItem("token") ?? sessionStorage.getItem("token") ?? null
    );
}

export class APIError extends Error {
    constructor(message, status, body = null) {
        super(message);
        this.name = "APIError";
        this.status = status;
        this.body = body;
    }
}
