import { getToken } from "../utils/authStorage";
import { buildApiError } from "../utils/apiErrors";
import { secureFetch } from "../utils/secureFetchWrapper";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const DEFAULT_LIMIT = 6;

const buildQuery = ({
  page = 1,
  limit = DEFAULT_LIMIT,
} = {}) => {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(limit));

  return params.toString();
};

const formatMoment = (momentValue) => {
  if (!momentValue) return "—";

  const date = new Date(momentValue);

  if (Number.isNaN(date.getTime())) {
    return String(momentValue);
  }

  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

export const getHouseLogsService = async ({
  page = 1,
  limit = DEFAULT_LIMIT,
} = {}) => {
  const token = getToken();

  if (!token) {
    throw new Error("No se encontró token de sesión");
  }

  const query = buildQuery({
    page,
    limit,
  });
  const response = await secureFetch(`${API_URL}/logs/house?${query}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw buildApiError(response, data, "Error al obtener los registros de la casa");
  }

  const logs = Array.isArray(data?.data)
    ? data.data.map((log) => ({
        ...log,
        momentLabel: formatMoment(log.moment),
      }))
    : [];

  const pagination = {
    page: Number(data?.currentPage) || Number(page) || 1,
    limit,
    total: Number(data?.totalRecords) || 0,
    totalPages: Number(data?.totalPages) || 0,
  };

  return {
    logs,
    pagination,
    data: logs,
    totalPages: pagination.totalPages,
    currentPage: pagination.page,
    totalRecords: pagination.total,
  };
};

export const downloadHouseLogsReportService = async ({ month, year }) => {
  const token = getToken();

  if (!token) {
    throw new Error("No se encontró token de sesión");
  }

  const params = new URLSearchParams({
    month: String(month),
    year: String(year),
  });

  const response = await secureFetch(`${API_URL}/logs/house/report/pdf?${params.toString()}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw buildApiError(response, data, "No se pudo generar el reporte");
  }

  const blob = await response.blob();
  const contentDisposition = response.headers.get("content-disposition") || "";
  const match = contentDisposition.match(/filename="([^"]+)"/);

  return {
    blob,
    fileName:
      match?.[1]
      || `reporte-logs-${year}-${String(month).padStart(2, "0")}.pdf`,
  };
};
