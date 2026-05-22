import AuthUtils from "../utils/auth.utils";
import { buildApiError } from "../utils/apiErrors";
import { secureFetch } from "../utils/secureFetchWrapper";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

class EmployeeService {
  static async getDetail(employeeId) {
    const token = AuthUtils.getToken();
    if (!token) throw new Error("No se encontró token de sesión");
    const response = await secureFetch(
      `${API_URL}/employee/employee-detail/${employeeId}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    const data = await response.json();
    if (!response.ok) throw buildApiError(response, data, "Error al obtener los documentos");
    return data;
  }

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

  static async getFormData() {
    const token = AuthUtils.getToken();
    const res = await fetch(`${API_URL}/employee/add`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) {
      if (data.error) throw new Error(data.error);
      throw new Error("Error cargando datos del formulario");
    }
    return data;
  }

  static async createEmployee(data) {
    const token = AuthUtils.getToken();
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    const res = await fetch(`${API_URL}/employee/add`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const response = await res.json();
    if (!res.ok) {
      let errorMessage = "Error desconocido. Intente más tarde";
      if (response.errors) {
        errorMessage = response.errors.map((e) => `${e.campo}: ${e.mensaje}`).join("\n");
      } else if (response.error) {
        errorMessage = response.error;
      }
      const error = new Error(errorMessage);
      if (response.redirect) error.redirect = response.redirect;
      throw error;
    }
    return response;
  }

  static async getEmployees(page = 1, limit = 7, search = "", active = "true") {
    const token = AuthUtils.getToken();
    const params = new URLSearchParams({ page, limit, search, active });
    const res = await secureFetch(`${API_URL}/employee/getAll?${params}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Error al obtener empleados");
    if (!data.success) throw new Error("Error en la respuesta del servidor");
    return { data: data.data, pagination: data.pagination };
  }

  static async getById(employeeId) {
    const token = AuthUtils.getToken();
    const res = await fetch(`${API_URL}/employee/${employeeId}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Error al obtener empleado");
    return data;
  }

  static async deactivateEmployee(employeeId, reason, addToBlacklist) {
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
  }

  static async addToBlacklist(curp) {
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
  }
}

export default EmployeeService;
