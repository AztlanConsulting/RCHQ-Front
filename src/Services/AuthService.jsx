const API_URL = import.meta.env.VITE_API_URL;

const buildApiError = (response, data, fallbackMessage) => {
  const errorMessage = new Error(data?.message || fallbackMessage);
  errorMessage.status = response.status;
  errorMessage.code = data?.code;
  errorMessage.blockedUntil = data?.blockedUntil;
  errorMessage.data = data?.data;
  errorMessage.errors = Array.isArray(data?.errors) ? data.errors : [];
  return errorMessage;
};

export const getReadableErrors = (err) => {
  if (Array.isArray(err?.errors) && err.errors.length > 0) {
    return err.errors.map((item) => item.message);
  }

  return [err?.message || "Ocurrió un error inesperado"];
};

export const savePreTwoFactorSession = (responseData) => {
  clearAuthStorage();
  const preTwoFactorToken = responseData?.preTwoFactorAuthToken;
  if (preTwoFactorToken) {
    localStorage.setItem(TOKEN_KEYS.preTwoFactorToken, preTwoFactorToken); //
  }
};

const TOKEN_KEYS = {
  session: "token",
  // firstLogin: "firstLoginToken",
  preTwoFactorToken: "preTwoFactorToken",
};

export const clearAuthStorage = () => {
  localStorage.removeItem(TOKEN_KEYS.session);
  // localStorage.removeItem(TOKEN_KEYS.firstLogin);
  localStorage.removeItem(TOKEN_KEYS.preTwoFactorToken);

  localStorage.removeItem("user");
};

export const saveLoginSession = (responseData) => {
  clearAuthStorage();
  const token = responseData?.data?.token;
  const user = responseData?.data?.user;
  if (token) localStorage.setItem(TOKEN_KEYS.session, token);
  if (user) localStorage.setItem("user", JSON.stringify(user));
};

export const loginService = async (email, password) => {
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

  if (data.isActiveTwoFactorAuth) {
    savePreTwoFactorSession(data);
  } else {
    saveLoginSession(data);
  }

  return data;
};

export const getToken = () => localStorage.getItem(TOKEN_KEYS.session);
export const getPreTwoFactorToken = () => localStorage.getItem(TOKEN_KEYS.preTwoFactorToken);

export const logoutService = () => {
  clearAuthStorage();
};

/* Fuera de alcance de la us 3
const getFirstLoginToken = () => localStorage.getItem("firstLoginToken");

const changePasswordService = async () => {};
*/

export const activateTwoFactorAuthService = async () => {
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

export const verifyTwoFactorAuthService = async (code) => {
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

export const validateLoginTwoFactorAuthService = async (code) => {
  const token = getPreTwoFactorToken();

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

export const deactivateTwoFactorAuthService = async (password) => {
  const token = getToken();

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
      "Error al verificar el código de autenticación de dos pasos",
    );
  }

  return data;
};
