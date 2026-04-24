
const API_URL = import.meta.env.API_URL;

const buildApiError = (response, data, fallbackMessage) => {
  const errorMessage = new Error(data?.message || fallbackMessage);
  errorMessage.status = response.status;
  errorMessage.code = data?.code;
  errorMessage.blockedUntil = data?.blockedUntil;
  errorMessage.data = data?.data;
  errorMessage.errors = Array.isArray(data?.errors) ? data.errors : [];
  return errorMessage;
};

const getReadableErrors = (err) => {
  if (Array.isArray(err?.errors) && err.errors.length > 0) {
    return err.errors.map((item) => item.message);
  }

  return [err?.message || "Ocurrió un error inesperado"];
};

const savePre2faSession = (responseData) => {
  clearAuthStorage();
  const pre2faToken = responseData?.pre2FAToken;
  if (pre2faToken) {
    localStorage.setItem(TOKEN_KEYS.pre2fa, pre2faToken); // "PRE_2FA"
  }
};

const TOKEN_KEYS = {
  session: "token",
  // firstLogin: "firstLoginToken",
  pre2fa: "PRE_2FA",
};

const clearAuthStorage = () => {
  localStorage.removeItem(TOKEN_KEYS.session);
  // localStorage.removeItem(TOKEN_KEYS.firstLogin);
  localStorage.removeItem(TOKEN_KEYS.pre2fa);

  localStorage.removeItem("user");
};

const saveLoginSession = (responseData) => {
  clearAuthStorage();
  const token = responseData?.data?.token;
  const user = responseData?.data?.user;
  if (token) localStorage.setItem(TOKEN_KEYS.session, token);
  if (user) localStorage.setItem("user", JSON.stringify(user));
};

const loginService = async (email, password) => {
  const response = await fetch(`${API_URL}/users/login`, {
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

  if (data.isActive2FA) {
    savePre2faSession(data);
  } else {
    saveLoginSession(data);
  }

  return data;
};

const getToken = () => localStorage.getItem(TOKEN_KEYS.session);
const getPre2faToken = () => localStorage.getItem(TOKEN_KEYS.pre2fa);

const logoutService = () => {
  clearAuthStorage();
};

/* Fuera de alcance de la us 3
const getFirstLoginToken = () => localStorage.getItem("firstLoginToken");

const changePasswordService = async () => {};
*/

const activateTwoFactorAuthService = async () => {
  const token = getToken();

  if (!token) {
    throw new Error("No se encontró token de sesión");
  }

  const response = await fetch(`${API_URL}/users/2fa/setup`, {
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

  const response = await fetch(`${API_URL}/users/2fa/verify`, {
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

  const response = await fetch(`${API_URL}/users/2fa/validate`, {
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

  const response = await fetch(`${API_URL}/users/status/2FA`, {
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
      "Error al verificar el código de autenticación de dos pasos",
    );
  }

  return data;
};

export {
  loginService,
  getToken,
  getPre2faToken,
  logoutService,
  getReadableErrors,
  activateTwoFactorAuthService,
  verify2FAService,
  validateLogin2FAService,
  getStatus2FA,
  desactivate2FAService,
};
