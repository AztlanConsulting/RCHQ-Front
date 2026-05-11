import { getToken }      from "../utils/authStorage";
import { buildApiError } from "../utils/apiErrors";
import { secureFetch }   from "../utils/secureFetchWrapper";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const getAllAbsencesService = async (page = 1, limit = 6, filters = {}) => {
  const token = getToken();
  if (!token) throw new Error("No se encontró token de sesión");

  const params = new URLSearchParams({ page, limit });
  if (filters.name)      params.append("name",      filters.name);
  if (filters.houseId)   params.append("houseId",   filters.houseId);
  if (filters.evidence)  params.append("evidence",  filters.evidence);
  if (filters.startFrom) params.append("startFrom", filters.startFrom);
  if (filters.endTo)     params.append("endTo",     filters.endTo);
  if (filters.deleted)   params.append("deleted",   filters.deleted);

  const response = await secureFetch(
    `${API_URL}/absence/all?${params.toString()}`,
    { method: "GET", headers: { Authorization: `Bearer ${token}` } }
  );

  const data = await response.json();
  if (!response.ok) throw buildApiError(response, data, "Error al obtener las ausencias");
  return data;
};