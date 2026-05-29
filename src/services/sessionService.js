import { setToken } from "../utils/authStorage";
import { buildApiError } from "../utils/apiErrors";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const refreshSessionService = async () => {
  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  const data = await response.json();

  if (!response.ok) {
    throw buildApiError(response, data, "Error al renovar la sesión");
  }

  const newToken = data?.data?.token;
  if (newToken) setToken(newToken);

  return data;
};

export { refreshSessionService };
