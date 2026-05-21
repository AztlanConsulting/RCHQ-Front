import AuthUtils from "../utils/auth.utils";
import { buildApiError } from "../utils/helpers/apiErrors";
import { secureFetch } from "@/utils/helpers/secureFetchWrapper";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

class EmployeeUpdateService {
  static async getUpdateForm() {
    const token = AuthUtils.getToken();
    if (!token) throw new Error("No se encontró token de sesión");
    const response = await secureFetch(`${API_URL}/employee/update-form`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok) throw buildApiError(response, data, "Error al obtener catálogos");
    return data;
  }

  static async updateBasicInfo(employeeId, body) {
    const token = AuthUtils.getToken();
    if (!token) throw new Error("No se encontró token de sesión");
    const response = await secureFetch(`${API_URL}/employee/${employeeId}/basic-info`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    if (!response.ok) throw buildApiError(response, data, "Error al actualizar información básica");
    return data;
  }

  static async updateContactInfo(employeeId, body) {
    const token = AuthUtils.getToken();
    if (!token) throw new Error("No se encontró token de sesión");
    const response = await secureFetch(`${API_URL}/employee/${employeeId}/contact-info`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    if (!response.ok) throw buildApiError(response, data, "Error al actualizar información de contacto");
    return data;
  }

  static async updateAdminInfo(employeeId, body) {
    const token = AuthUtils.getToken();
    if (!token) throw new Error("No se encontró token de sesión");
    const response = await secureFetch(`${API_URL}/employee/${employeeId}/admin-info`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    if (!response.ok) throw buildApiError(response, data, "Error al actualizar información administrativa");
    return data;
  }
}

export default EmployeeUpdateService;
