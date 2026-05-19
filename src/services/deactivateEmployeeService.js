import { secureFetch } from "@/utils/secureFetchWrapper";
import { buildApiError } from "@/utils/apiErrors";

export const deactivateEmployeeService = async (employeeId, reason, addToBlacklist) => {
  const response = await secureFetch(`/employee/${employeeId}/deactivate`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reason, addToBlacklist }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw buildApiError(response, data, data?.message ?? "Error al dar de baja al empleado.");
  }

  return data;
};

export const insertIntoBlacklistService = async (curp) => {
  const response = await secureFetch("/blacklist/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ curp }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw buildApiError(response, data, data?.message ?? "Error al agregar a la lista negra.");
  }

  return data;
};