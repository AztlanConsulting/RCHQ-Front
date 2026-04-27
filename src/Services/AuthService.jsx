import {
  clearAuthStorage,
  getToken,
  getPreTwoFactorAuthToken,
  getFirstLoginToken,
  setToken,
  setStoredUser,
  setPreTwoFactorAuthToken,
  setFirstLoginToken,
  removePreTwoFactorAuthToken,
} from "../utils/authStorage";
import { buildApiError, getReadableErrors } from "../utils/apiErrors";

const API_URL = import.meta.env.VITE_API_URL;

const saveLoginSession = (responseData) => {
  clearAuthStorage();
  const token = responseData?.data?.token;
  const user = responseData?.data?.user;
  if (token) setToken(token);
  if (user) setStoredUser(user);
};

export const savePreTwoFactorSession = (responseData) => {
  clearAuthStorage();
  const preTwoFactorAuthToken = responseData?.preTwoFactorAuthToken;
  if (preTwoFactorAuthToken) {
    setPreTwoFactorAuthToken(preTwoFactorAuthToken);
  }
};

const saveFirstLoginSession = (responseData) => {
  clearAuthStorage();
  const firstLoginToken = responseData?.data?.firstLoginToken;
  if (firstLoginToken) {
    setFirstLoginToken(firstLoginToken);
  }
};

export const loginService = async (email, password) => {
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
    saveFirstLoginSession(data);
    return data;
  }

  if (data?.isActiveTwoFactorAuth) {
    savePreTwoFactorSession(data);
    return data;
  }

  saveLoginSession(data);
  return data;
};

export const logoutService = () => {
  clearAuthStorage();
};

export const activateTwoFactorAuthService = async () => {
  const token = getToken();
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
};

export const verifyTwoFactorAuthService = async (code) => {
  const token = getToken();
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
};

export const validateLoginTwoFactorAuthService = async (code) => {
  const token = getPreTwoFactorAuthToken();
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
};

export const getTwoFactorAuthStatus = async () => {
  const token = getToken();
  if (!token) throw new Error("No se encontró token de sesión");

  const response = await fetch(`${API_URL}/auth/status/2FA`, {
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
};

export const deactivateTwoFactorAuthService = async (password) => {
  const token = getToken();
  if (!token) throw new Error("No se encontró token de sesión");

  const response = await fetch(`${API_URL}/users/2fa/disable`, {
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
};

export {
  getReadableErrors,
  getToken,
  getPreTwoFactorAuthToken,
  getFirstLoginToken,
  removePreTwoFactorAuthToken,
};
