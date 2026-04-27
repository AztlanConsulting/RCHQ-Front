import {
  clearAuthStorage,
  getToken,
  getPre2faToken,
  getFirstLoginToken,
  setToken,
  setStoredUser,
  setPre2faToken,
  setFirstLoginToken,
  removePre2faToken,
} from "../utils/authStorage";
import { buildApiError, getReadableErrors } from "../utils/apiErrors";

const API_URL = "http://localhost:3000";

const saveLoginSession = (responseData) => {
  clearAuthStorage();
  const token = responseData?.data?.token;
  const user = responseData?.data?.user;

  if (token) setToken(token);
  if (user) setStoredUser(user);
};

const savePre2faSession = (responseData) => {
  clearAuthStorage();
  const pre2faToken = responseData?.pre2FAToken;
  if (pre2faToken) {
    setPre2faToken(pre2faToken);
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
    headers: {
      "Content-Type": "application/json",
    },
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

  if (data?.isActive2FA) {
    savePre2faSession(data);
    return data;
  }

  saveLoginSession(data);
  return data;
};

const logoutService = () => {
  clearAuthStorage();
};

const activateTwoFactorAuthService = async () => {
  const token = getToken();

  if (!token) {
    throw new Error("No se encontró token de sesión");
  }

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

const verify2FAService = async (code) => {
  const token = getToken();

  if (!token) {
    throw new Error("No se encontró token de sesión");
  }

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

const validateLogin2FAService = async (code) => {
  const token = getPre2faToken();

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

const getStatus2FA = async () => {
  const token = getToken();

  if (!token) {
    throw new Error("No se encontró token de sesión");
  }

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
      "Error al verificar el código de autenticación de dos pasos",
    );
  }

  return data;
};
const desactivate2FAService = async (password) => {
  const token = getToken();

  if (!token) {
    throw new Error("No se encontró token de sesión");
  }

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
  loginService,
  getToken,
  getPre2faToken,
  getFirstLoginToken,
  logoutService,
  getReadableErrors,
  activateTwoFactorAuthService,
  verify2FAService,
  validateLogin2FAService,
  getStatus2FA,
  desactivate2FAService,
  removePre2faToken,
};