import { secureFetch } from "../utils/secureFetchWrapper";

const parseJson = async (res) => {
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        const validationMessage = data.errors?.[0]?.message;

        throw new Error(
            validationMessage ||
            data.message ||
            "No se pudo completar la operación de vacaciones",
        );
    }

    if (data.success === false) {
        throw new Error(data.message || "Error en la respuesta del servidor");
    }

    return data;
};

export const getVacationEmployees = async () => {
    const res = await secureFetch(`/vacation/employees/eligible`, {
        method: "GET",
    });

    const data = await parseJson(res);

    return data?.data?.employees ?? [];
};

export const getRemainingVacations = async (employeeId) => {
    const res = await secureFetch(`/vacation/remaining/${employeeId}`, {
        method: "GET",
    });

    const data = await parseJson(res);

    return {
        remainingVacations: data?.data?.remainingVacations ?? 0,
        startDate: data?.data?.startDate ?? "",
        endDate: data?.data?.endDate ?? "",
    };
};

export const registerEmployeeVacation = async ({
    employeeId,
    startDate,
    endDate,
}) => {
    const res = await secureFetch(
        `/vacation/employees/${employeeId}/register`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                startDate,
                endDate,
            }),
        },
    );

    const data = await parseJson(res);

    return data?.data?.vacationRequest ?? null;
};

export const updateVacationRequestDates = async ({
    vacationRequestId,
    startDate,
    endDate,
}) => {
    const res = await secureFetch(
        `/vacation/request/${vacationRequestId}/dates`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                startDate,
                endDate,
            }),
        },
    );

    const data = await parseJson(res);

    return data?.data?.vacationRequest ?? null;
};

export const requestEmployeeVacation = async ({ startDate, endDate }) => {
    const res = await secureFetch(`/vacation/request`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            startDate,
            endDate,
        }),
    });

    const data = await parseJson(res);

    return data?.data?.vacationRequest ?? null;
};

export const deleteVacationRequest = async (vacationRequestId) => {
    const res = await secureFetch(
        `/vacation/request/${vacationRequestId}`,
        {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({}),
        },
    );

    const data = await parseJson(res);

    return data?.data?.vacationRequest ?? null;
};
