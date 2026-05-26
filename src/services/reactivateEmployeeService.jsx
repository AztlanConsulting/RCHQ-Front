import { secureFetch } from "@/utils/secureFetchWrapper";
import { buildApiError } from "@/utils/apiErrors";

export const reactivateEmployeeService = async (employeeId) => {
  const response = await secureFetch(`/employee/${employeeId}/reactivate`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    // body: JSON.stringify({ reason, addToBlacklist }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw buildApiError(response, data, data?.message ?? "Error al dar de baja al empleado.");
  }

  return data;
};
