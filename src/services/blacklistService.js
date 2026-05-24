import { secureFetch } from "../utils/secureFetchWrapper";

const API_URL = import.meta.env.VITE_API_URL;

const getToken = () => localStorage.getItem("token");

export const getBlacklist = async (page = 1, limit = 7, curp = "", isBlacklisted = undefined) => {
  const token = getToken();

  const params = new URLSearchParams({ page, limit });
  if (curp) params.append("curp", curp);
  if (isBlacklisted !== undefined) params.append("isBlacklisted", isBlacklisted);

  const res = await secureFetch(`${API_URL}/blacklist?${params}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Error al obtener la lista negra");
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
  const token = getToken();

  const res = await fetch(`${API_URL}/blacklist`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ curp, reason }),
  });

  const data = await res.json();

  if (!res.ok) {
    const error = new Error(data.message || "Error al agregar a la lista negra");
    error.status = res.status;
    throw error;
  }

  return data;
};

export const removeFromBlacklist = async (curp, reason) => {
  const token = getToken();

  const res = await fetch(`${API_URL}/blacklist/delete`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ curp, reason }),
  });

  const data = await res.json();

  if (!res.ok) {
    const error = new Error(data.message || "Error al eliminar de la lista negra");
    error.status = res.status;
    throw error;
  }

  return data;
};