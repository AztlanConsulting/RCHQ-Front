import { getToken } from "../utils/authStorage";
import { buildApiError } from "../utils/apiErrors";
import { secureFetch } from "../utils/secureFetchWrapper";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const getHouseLogsService = async (page = 1, limit = 10) => {
  const token = getToken();

  if (!token) {
    throw new Error("No se encontró token de sesión");
  }

  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  const response = await secureFetch(`${API_URL}/logs/house?${params.toString()}`, {
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

  return {
    data: Array.isArray(data?.data) ? data.data : [],
    totalPages: Number(data?.totalPages) || 0,
    currentPage: Number(data?.currentPage) || 1,
    totalRecords: Number(data?.totalRecords) || 0,
  };
};
