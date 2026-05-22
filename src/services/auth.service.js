import AuthUtils from "../utils/auth.utils";
import { buildApiError, getReadableErrors } from "../utils/apiErrors";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

class AuthService {
  static #saveLoginSession(responseData) {
    AuthUtils.clearAuthStorage();
    const token = responseData?.data?.token;
    const user = responseData?.data?.user;
    if (token) AuthUtils.setToken(token);
    if (user) AuthUtils.setStoredUser(user);
  }

  static #savePreTwoFactorSession(responseData) {
    AuthUtils.clearAuthStorage();
    const preTwoFactorAuthToken = responseData?.preTwoFactorAuthToken;
    if (preTwoFactorAuthToken) {
      AuthUtils.setPreTwoFactorAuthToken(preTwoFactorAuthToken);
    }
  }

  static #saveFirstLoginSession(responseData) {
    AuthUtils.clearAuthStorage();
    const firstLoginToken = responseData?.data?.firstLoginToken;
    if (firstLoginToken) {
      AuthUtils.setFirstLoginToken(firstLoginToken);
    }
  }

  static async login(email, password) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw buildApiError(response, data, "Error al iniciar sesión");
    }

    if (data?.nextStep === "CHANGE_PASSWORD_FIRST_LOGIN") {
      AuthService.#saveFirstLoginSession(data);
      return data;
    }

    if (data?.isActiveTwoFactorAuth) {
      AuthService.#savePreTwoFactorSession(data);
      return data;
    }

    AuthService.#saveLoginSession(data);
    return data;
  }

  static logout() {
    AuthUtils.clearAuthStorage();
  }

  static async activateTwoFactor() {
    const token = AuthUtils.getToken();
    if (!token) throw new Error("No se encontró token de sesión");

    const response = await fetch(`${API_URL}/auth/2fa/setup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();

    if (!response.ok) {
      throw buildApiError(
        response,
        data,
        "Error al activar la autenticación de dos pasos",
      );
    }

    return data;
  }

  static async verifyTwoFactor(code) {
    const token = AuthUtils.getToken();
    if (!token) throw new Error("No se encontró token de sesión");

    const response = await fetch(`${API_URL}/auth/2fa/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ token: code }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw buildApiError(
        response,
        data,
        "Error al verificar el código de autenticación de dos pasos",
      );
    }

    return data;
  }

  static async validateLoginTwoFactor(code) {
    const token = AuthUtils.getPreTwoFactorAuthToken();
    if (!token) throw new Error("No se encontró token de pre-autenticación");

    const response = await fetch(`${API_URL}/auth/2fa/validate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ token: code }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw buildApiError(
        response,
        data,
        "Error al verificar el código de autenticación de dos pasos",
      );
    }

    return data;
  }

  static async getTwoFactorStatus() {
    const token = AuthUtils.getToken();
    if (!token) throw new Error("No se encontró token de sesión");

    const response = await fetch(`${API_URL}/auth/2fa/status`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw buildApiError(
        response,
        data,
        "Error al obtener estado de la autenticación de dos pasos",
      );
    }

    return data;
  }

  static async deactivateTwoFactor(password) {
    const token = AuthUtils.getToken();
    if (!token) throw new Error("No se encontró token de sesión");

    const response = await fetch(`${API_URL}/auth/2fa/disable`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw buildApiError(
        response,
        data,
        "Error al desactivar la autenticación de dos pasos",
      );
    }

    return data;
  }

  static getToken() {
    return AuthUtils.getToken();
  }

  static getPreTwoFactorToken() {
    return AuthUtils.getPreTwoFactorAuthToken();
  }

  static getFirstLoginToken() {
    return AuthUtils.getFirstLoginToken();
  }

  static removePreTwoFactorToken() {
    return AuthUtils.removePreTwoFactorAuthToken();
  }

  static getReadableErrors(err) {
    return getReadableErrors(err);
  }
}

export default AuthService;
