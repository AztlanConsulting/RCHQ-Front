import { buildApiError } from "../utils/apiErrors";
import { secureFetch } from "@/utils/secureFetchWrapper";

export const getEmployeeDetailService = async (employeeId) => {
  const response = await secureFetch(
    `/employee/employee-detail/${employeeId}`,
  );

  const data = await response.json();
  
  if (!response.ok) {
    throw buildApiError(response, data, "Error al obtener los documentos");
  }
  return data;
};
