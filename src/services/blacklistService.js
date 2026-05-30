import { secureFetch } from "../utils/secureFetchWrapper";
import { buildApiError } from "../utils/apiErrors";

const parseJsonResponse = async (res) => {
  try {
    return await res.json();
  } catch {
    return {};
  }
};

export const getBlacklist = async (
  page = 1,
  limit = 7,
  search = "",
  isBlacklisted = undefined,
) => {
  const params = new URLSearchParams({ page, limit });
  if (search) params.append("search", search);
  if (isBlacklisted !== undefined) params.append("isBlacklisted", isBlacklisted);

  const res = await secureFetch(`/blacklist?${params}`, {
    method: "GET",
  });

  const data = await parseJsonResponse(res);

  if (!res.ok) {
    throw buildApiError(
      res,
      data,
      data.message || "Error al obtener la lista negra",
    );
  }

  if (!data.success) {
    throw new Error("Error en la respuesta del servidor");
  }

  return {
    data: data.employees,
    pagination: data.pagination,
  };
};

export const addToBlacklist = async (curp, reason) => {
  const res = await secureFetch(`/blacklist`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ curp, reason }),
  });

  const data = await parseJsonResponse(res);

  if (!res.ok) {
    throw buildApiError(
      res,
      data,
      data.message || "Error al agregar a la lista negra",
    );
  }

  return data;
};

export const removeFromBlacklist = async (curp, reason) => {
  const res = await secureFetch(`/blacklist/delete`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ curp, reason }),
  });

  const data = await parseJsonResponse(res);

  if (!res.ok) {
    throw buildApiError(
      res,
      data,
      data.message || "Error al eliminar de la lista negra",
    );
  }

  return data;
};
