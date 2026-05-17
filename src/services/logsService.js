import { secureFetch } from "../utils/secureFetchWrapper";

const API_URL = import.meta.env.VITE_API_URL;
const DEFAULT_LIMIT = 6;

const buildQuery = ({
  page = 1,
  limit = DEFAULT_LIMIT,
  search = "",
  actionIds = [],
  startDate = "",
  endDate = "",
} = {}) => {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(limit));

  const trimmedSearch = search.trim();
  const trimmedStartDate = startDate.trim();
  const trimmedEndDate = endDate.trim();
  if (trimmedSearch) params.set("search", trimmedSearch);
  if (actionIds.length > 0) params.set("actionIds", actionIds.join(","));
  if (trimmedStartDate) params.set("startDate", trimmedStartDate);
  if (trimmedEndDate) params.set("endDate", trimmedEndDate);

  return params.toString();
};

const formatMoment = (momentValue) => {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(momentValue));
};

const extractErrorMessage = async (res, fallbackMessage) => {
  try {
    const data = await res.json();
    return data.message || fallbackMessage;
  } catch {
    return fallbackMessage;
  }
};

export const getHouseLogsService = async ({
  page = 1,
  limit = DEFAULT_LIMIT,
  search = "",
  actionIds = [],
  startDate = "",
  endDate = "",
} = {}) => {
  const query = buildQuery({ page, limit, search, actionIds, startDate, endDate });
  const res = await secureFetch(`${API_URL}/logs/house?${query}`, {
    method: "GET",
  });

  if (!res.ok) {
    throw new Error(await extractErrorMessage(res, "No se pudieron cargar los logs"));
  }

  const data = await res.json();

  if (!data.success) {
    throw new Error("Error en la respuesta del servidor");
  }

  return {
    logs: Array.isArray(data.data)
      ? data.data.map((log) => ({
          ...log,
          momentLabel: formatMoment(log.moment),
        }))
      : [],
    pagination: {
      page: data.currentPage || page,
      limit,
      total: data.totalRecords || 0,
      totalPages: data.totalPages || 0,
    },
  };
};

export const getLogsActionsService = async () => {
  const res = await secureFetch(`${API_URL}/logs/actions`, {
    method: "GET",
  });

  if (!res.ok) {
    throw new Error(await extractErrorMessage(res, "No se pudieron cargar las acciones"));
  }

  const data = await res.json();

  if (!data.success) {
    throw new Error("Error en la respuesta del servidor");
  }

  return Array.isArray(data.data) ? data.data : [];
};

export const downloadHouseLogsReportService = async ({ month, year }) => {
  const params = new URLSearchParams({
    month: String(month),
    year: String(year),
  });

  const res = await secureFetch(`${API_URL}/logs/house/report/pdf?${params.toString()}`, {
    method: "GET",
  });

  if (!res.ok) {
    throw new Error(await extractErrorMessage(res, "No se pudo generar el reporte"));
  }

  const blob = await res.blob();
  const contentDisposition = res.headers.get("content-disposition") || "";
  const match = contentDisposition.match(/filename="([^"]+)"/);

  return {
    blob,
    fileName:
      match?.[1] ||
      `reporte-logs-${year}-${String(month).padStart(2, "0")}.pdf`,
  };
};
