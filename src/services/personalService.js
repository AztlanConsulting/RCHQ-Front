import { secureFetch } from "../utils/secureFetchWrapper";
const API_URL = import.meta.env.VITE_API_URL;

export const getEmployeeFormData = async () => {
  const res = await secureFetch(`${API_URL}/employee/add`, {
    method: "GET",
  });

  const data = await res.json();

  if (!res.ok) {
    if (data.error) {
      throw new Error(data.error);
    }
    throw new Error("Error cargando datos del formulario");
  }

  return data;
};

export const createEmployee = async (data) => {
  const formData = new FormData();

  Object.keys(data).forEach((key) => {
    if (data[key] !== null && data[key] !== undefined) {
      formData.append(key, data[key]);
    }
  });

  const res = await secureFetch(`${API_URL}/employee/add`, {
    method: "POST",
    body: formData,
  });

  const response = await res.json();

  if (!res.ok) {
    let errorMessage = "Error desconocido. Intente más tarde";

    if (response.errors) {
      errorMessage = response.errors
        .map((e) => `${e.campo}: ${e.mensaje}`)
        .join("\n");
    } else if (response.error) {
      errorMessage = response.error;
    }

    const error = new Error(errorMessage);

    if (response.redirect) {
      error.redirect = response.redirect;
    }

    throw error;
  }

  return response;
};

export const getEmployees = async (
  page = 1,
  limit = 7,
  search = "",
  active = "true",
) => {
  const params = new URLSearchParams({
    page,
    limit,
    search,
    active,
  });

  const res = await secureFetch(`${API_URL}/employee/getAll?${params}`, {
    method: "GET",
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Error al obtener empleados");
  }

  if (!data.success) {
    throw new Error("Error en la respuesta del servidor");
  }

  return {
    data: data.data,
    pagination: data.pagination,
  };
};

export const getEmployeeById = async (employeeId) => {
  const res = await secureFetch(`${API_URL}/employee/${employeeId}`, {
    method: "GET",
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Error al obtener empleado");
  }

  return data;
};
