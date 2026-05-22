import { secureFetch } from "../utils/secureFetchWrapper";

const API_URL = import.meta.env.VITE_API_URL;

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
    const res = await secureFetch(`${API_URL}/vacation/employees/eligible`, {
        method: "GET",
    });

    const data = await parseJson(res);

    return data?.data?.employees ?? [];
};

export const getRemainingVacations = async (employeeId) => {
    const res = await secureFetch(`${API_URL}/vacation/remaining/${employeeId}`, {
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
        `${API_URL}/vacation/employees/${employeeId}/register`,
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
