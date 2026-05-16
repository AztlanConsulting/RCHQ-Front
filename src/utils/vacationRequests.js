export const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "—";

    return new Intl.DateTimeFormat("es-MX", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        timeZone: "UTC",
    }).format(date);
};

export const getSafeText = (value, fallback = "—") => {
    if (value === null || value === undefined) return fallback;

    const text = String(value).trim();

    return text || fallback;
};

export const getStatusClassName = (status) => {
    if (status === 1) {
        return "bg-green-100 text-green-800";
    }

    if (status === 2) {
        return "bg-red-100 text-red-800";
    }

    return "bg-yellow-100 text-yellow-800";
};
