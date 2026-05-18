import { secureFetch } from "../utils/secureFetchWrapper";

const API_URL = import.meta.env.VITE_API_URL;

const buildQueryParams = ({
    page = 1,
    limit = 6,
    search = "",
    startDate = "",
    endDate = "",
    status = "",
}) => {
    const params = new URLSearchParams();

    params.set("page", String(page));
    params.set("limit", String(limit));

    const trimmedSearch = search.trim();

    if (trimmedSearch) params.set("search", trimmedSearch);
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    if (status) params.set("status", status);

    return params.toString();
};

const parseVacationRequestsResponse = async (res) => {
    const data = await res.json();

    if (!res.ok) {
        const validationMessage = data.errors?.[0]?.message;

        throw new Error(
            validationMessage ||
            data.message ||
            "Error al obtener solicitudes de vacaciones",
        );
    }

    if (!data.success) {
        throw new Error("Error en la respuesta del servidor");
    }

    return {
        data: Array.isArray(data.data) ? data.data : [],
        pagination: data.pagination || {
            page: 1,
            limit: 6,
            total: 0,
            totalPages: 0,
        },
    };
};

const parseVacationRequestActionResponse = async (res) => {
    const data = await res.json();

    if (!res.ok) {
        const validationMessage = data.errors?.[0]?.message;

        throw new Error(
            validationMessage ||
            data.message ||
            "Error al actualizar la solicitud de vacaciones",
        );
    }

    if (!data.success) {
        throw new Error(data.message || "Error en la respuesta del servidor");
    }

    return {
        message: data.message || "Solicitud actualizada correctamente",
        vacationRequest: data.data?.vacationRequest || null,
    };
};

export const getPendingVacationRequests = async ({
    page = 1,
    limit = 6,
    search = "",
    startDate = "",
    endDate = "",
}) => {
    const query = buildQueryParams({
        page,
        limit,
        search,
        startDate,
        endDate,
    });

    const res = await secureFetch(`${API_URL}/vacation/requests/pending?${query}`, {
        method: "GET",
    });

    return parseVacationRequestsResponse(res);
};

export const getReviewedVacationRequests = async ({
    page = 1,
    limit = 6,
    search = "",
    startDate = "",
    endDate = "",
    status = "all",
}) => {
    const query = buildQueryParams({
        page,
        limit,
        search,
        startDate,
        endDate,
        status,
    });

    const res = await secureFetch(`${API_URL}/vacation/requests/reviewed?${query}`, {
        method: "GET",
    });

    return parseVacationRequestsResponse(res);
};

export const approveVacationRequest = async (vacationRequestId) => {
    const res = await secureFetch(
        `${API_URL}/vacation/request/${vacationRequestId}/approve`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({}),
        },
    );

    return parseVacationRequestActionResponse(res);
};

export const rejectVacationRequest = async (vacationRequestId) => {
    const res = await secureFetch(
        `${API_URL}/vacation/request/${vacationRequestId}/reject`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({}),
        },
    );

    return parseVacationRequestActionResponse(res);
};
