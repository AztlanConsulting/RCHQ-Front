import AuthUtils from "../utils/auth.utils";
import { buildApiError } from "../utils/apiErrors";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

class PasswordService {
  static async changePasswordFirstLogin(newPassword, confirmPassword) {
    const token = AuthUtils.getFirstLoginToken();

    if (!token) {
      throw new Error("No se encontró token de primer inicio de sesión");
    }

    const response = await fetch(`${API_URL}/auth/first-login/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ newPassword, confirmPassword }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw buildApiError(
        response,
        data,
        "Error al cambiar la contraseña de primer inicio de sesión",
      );
    }

    AuthUtils.removeFirstLoginToken();

    const sessionToken = data?.data?.token;
    const user = data?.data?.user;

    if (sessionToken) {
      AuthUtils.setToken(sessionToken);
    }
    if (user) {
      AuthUtils.setStoredUser(user);
    }

    return data;
  }

  static async changePassword(currentPassword, newPassword, confirmPassword) {
    const token = AuthUtils.getToken();

    if (!token) {
      throw new Error("No se encontró token de sesión");
    }

    const response = await fetch(`${API_URL}/auth/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw buildApiError(response, data, "Error al cambiar la contraseña");
    }

    return data;
  }
}

export default PasswordService;
