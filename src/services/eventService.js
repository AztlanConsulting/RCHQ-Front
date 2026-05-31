import { secureFetch } from "../utils/secureFetchWrapper";

export async function createHouseEvent(payload) {
    const response = await secureFetch(`/event/house/add`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
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
    const response = await secureFetch(`/event/getAllTypes`);

    if (!response.ok) {
        throw new APIError("Error al cargar tipos de evento", response.status);
    }

    const json = await response.json();
    return json?.data?.eventTypes ?? [];
}

export async function getEmployeesForSelector(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = `/event/personal/employees${query ? `?${query}` : ""}`;

    const response = await secureFetch(url);

    const json = await response.json();

    if (!response.ok) {
        throw new APIError(
            json?.message ?? "Error al cargar empleados",
            response.status,
            json,
        );
    }

    return json?.data?.employees ?? [];
}

export async function createGlobalEvent(payload) {
    const response = await secureFetch(`${BASE_URL}/event/global/add`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    const json = await response.json();

    if (!response.ok && response.status !== 409) {
        throw new APIError(
            json?.message ?? "Error al registrar el evento global",
            response.status,
            json,
        );
    }

    return json;
}

export async function createPersonalEvent(payload) {
    const response = await secureFetch(`/event/personal/add`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    const json = await response.json();

    if (!response.ok && response.status !== 409) {
        throw new APIError(
            json?.message ?? "Error al registrar el evento personal",
            response.status,
            json,
        );
    }

    return json;
}

export class APIError extends Error {
    constructor(message, status, body = null) {
        super(message);
        this.name = "APIError";
        this.status = status;
        this.body = body;
    }
}
