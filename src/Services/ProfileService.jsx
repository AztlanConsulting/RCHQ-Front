// src/Services/ProfileService.jsx

const API_URL = "http://localhost:3000";

const buildApiError = (response, data, fallbackMessage) => {
  const errorMessage = new Error(data?.message || fallbackMessage);
  errorMessage.status = response.status;
  errorMessage.code = data?.code;
  errorMessage.errors = Array.isArray(data?.errors) ? data.errors : [];
  return errorMessage;
};

const getReadableErrors = (err) => {
  if (Array.isArray(err?.errors) && err.errors.length > 0) {
    return err.errors.map((item) => item.message);
  }
  if (err?.message) {
    return [err.message];
  }
  return ["Ocurrió un error inesperado"];
};

/**
 * getUserData
 * GET /auth/profile
 * Requiere token en localStorage (lo inyecta getToken de AuthService).
 */
const getUserData = async (token) => {
  const response = await fetch(`${API_URL}/user/profile`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    // Mapeamos los status relevantes al mensaje legible
    const fallbackMessages = {
      401: "No tienes permisos para ver esta información.",
      404: "Ruta no encontrada.",
      501: "Ocurrió un problema al obtener la información.",
    };
    throw buildApiError(
      response,
      data,
      fallbackMessages[response.status] ?? "Error desconocido."
    );
  }

  return data;
};

export { getUserData, getReadableErrors };