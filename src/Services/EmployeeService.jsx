import { getToken } from "./AuthService";
import { buildApiError } from "../utils/apiErrors";

const API_URL = import.meta.env.VITE_API_URL;

export const deactivateEmployeeService = async (employeeId, reason, intoBlacklist) => {
  const token = getToken();
  if (!token) throw new Error("No se encontró token de sesión");

  const response = await fetch(`${API_URL}/employee/${employeeId}/deactivate`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ reason, intoBlacklist }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw buildApiError(response, data, "Error al dar de baja al empleado");
  }

  return data;
};