import { buildApiError } from "../utils/apiErrors";
import { secureFetch } from "@/utils/secureFetchWrapper";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const getEmployeeDetailService = async (employeeId) => {
  const response = await secureFetch(
    `${API_URL}/employee/employee-detail/${employeeId}`,
  );

  const data = await response.json();
  
  if (!response.ok) {
    throw buildApiError(response, data, "Error al obtener los documentos");
  }
  return data;
};
