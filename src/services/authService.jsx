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

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const saveLoginSession = (responseData) => {
  clearAuthStorage();
  const token = responseData?.data?.token;
  const user = responseData?.data?.user;
  if (token) setToken(token);
  if (user) setStoredUser(user);
};

const savePreTwoFactorSession = (responseData) => {
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

const loginService = async (email, password) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
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

const logoutService = async () => {
  clearAuthStorage();
  try {
    await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
  } catch (error) {
    console.error("Error al cerrar sesión en el servidor:", error);
  }
};

const activateTwoFactorAuthService = async () => {
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

const verifyTwoFactorAuthService = async (code) => {
  const token = getToken();
  if (!token) throw new Error("No se encontró token de sesión");

  const response = await fetch(`${API_URL}/auth/2fa/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
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

const validateLoginTwoFactorAuthService = async (code) => {
  const token = getPreTwoFactorAuthToken();
  if (!token) throw new Error("No se encontró token de pre-autenticación");

  const response = await fetch(`${API_URL}/auth/2fa/validate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
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

const getTwoFactorAuthStatus = async () => {
  const token = getToken();
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
};

const deactivateTwoFactorAuthService = async (password) => {
  const token = getToken();
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
};

export {
  savePreTwoFactorSession,
  loginService,
  refreshSessionService,
  logoutService,
  activateTwoFactorAuthService,
  verifyTwoFactorAuthService,
  validateLoginTwoFactorAuthService,
  getTwoFactorAuthStatus,
  deactivateTwoFactorAuthService,
  getReadableErrors,
  getToken,
  getPreTwoFactorAuthToken,
  getFirstLoginToken,
  removePreTwoFactorAuthToken,
};
