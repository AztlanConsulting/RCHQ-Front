import { buildApiError } from "../utils/apiErrors";
import { secureFetch } from "@/utils/secureFetchWrapper";

export const getUpdateFormService = async () => {
  const response = await secureFetch(`/employee/update-form`);
  const data = await response.json();
  if (!response.ok) throw buildApiError(response, data, "Error al obtener catálogos");
  return data;
};

export const updateBasicInfoService = async (employeeId, body) => {
  const isFormData = body instanceof FormData;
  const response = await secureFetch(`/employee/${employeeId}/basic-info`, {
    method: "PUT",
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
    },
    body: isFormData ? body : JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) throw buildApiError(response, data, "Error al actualizar información básica");
  return data;
};

export const updateContactInfoService = async (employeeId, body) => {
  const response = await secureFetch(`/employee/${employeeId}/contact-info`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) throw buildApiError(response, data, "Error al actualizar información de contacto");
  return data;
};

export const updateAdminInfoService = async (employeeId, body) => {
  const response = await secureFetch(`/employee/${employeeId}/admin-info`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) throw buildApiError(response, data, "Error al actualizar información administrativa");
  return data;
};
