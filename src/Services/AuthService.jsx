const API_URL = "http://localhost:3000";

const buildApiError = (data, fallbackMessage) => {
  const errorMessage = new Error(data.message || fallbackMessage);
  errorMessage.status = data.status;
  errorMessage.nextStep = data.nextStep;
  errorMessage.blockedUntil = data.blockedUntil;
  errorMessage.data = data.data;
  errorMessage.errors = Array.isArray(data.errors) ? data.errors : [];
  return errorMessage;
};

const getReadableErrors = (err) => {
  if (Array.isArray(err?.errors) && err.errors.length > 0) {
    return err.errors.map((item) => item.message);
  }

  return [err?.message || "Ocurrió un error inesperado"];
};

const TOKEN_KEYS = {
  session: "token",
  firstLogin: "firstLoginToken",
  pre2fa: "pre2faToken",
};

const clearAuthStorage = () => {
  localStorage.removeItem(TOKEN_KEYS.session);
  localStorage.removeItem(TOKEN_KEYS.firstLogin);
  localStorage.removeItem(TOKEN_KEYS.pre2fa);
};

const saveLoginTokens = (data) => {
  clearAuthStorage();

  if (data.firstLoginToken) {
    localStorage.setItem(TOKEN_KEYS.firstLogin, data.firstLoginToken);
  }

  if (data.pre2faToken) {
    localStorage.setItem(TOKEN_KEYS.pre2fa, data.pre2faToken);
  }

  if (data.token) {
    localStorage.setItem(TOKEN_KEYS.session, data.token);
  }
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
    throw buildApiError(data, "Error al iniciar sesión");
  }

  saveLoginTokens(data);

  return data;
};

const activateTwoFactorAuthService = async () => {
  const sessionToken = getToken();

  const response = await fetch(`${API_URL}/users/2fa/setup`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${sessionToken}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw buildApiError(data, "Error al generar QR");
  }

  return data;
};

const verify2FAService = async (token) => {
  const sessionToken = getToken();

  const response = await fetch(`${API_URL}/users/2fa/verify-setup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sessionToken}`,
    },
    body: JSON.stringify({ token }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw buildApiError(data, "Código inválido");
  }

  return data;
};

const skip2FAService = async () => {
  const sessionToken = getToken();

  if (!sessionToken) {
    throw new Error("No hay sesión activa para omitir la activación de 2FA");
  }

  return {
    success: true,
    message: "Activación de 2FA omitida",
    nextStep: "LOGIN_COMPLETE",
  };
};

const changePasswordService = async (newPassword, confirmPassword) => {
  const firstLoginToken = getFirstLoginToken();

  const response = await fetch(`${API_URL}/users/first-login/change-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${firstLoginToken}`,
    },
    body: JSON.stringify({ newPassword, confirmPassword }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw buildApiError(data, "Error al cambiar la contraseña");
  }

  if (data.token) {
    localStorage.setItem(TOKEN_KEYS.session, data.token);
  }
  localStorage.removeItem(TOKEN_KEYS.firstLogin);

  return data;
};

const validateLogin2FAService = async (token) => {
  const pre2faToken = getPre2faToken();

  const response = await fetch(`${API_URL}/users/2fa/validate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${pre2faToken}`,
    },
    body: JSON.stringify({ token }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw buildApiError(data, "Código 2FA inválido");
  }

  if (data.token) {
    localStorage.setItem(TOKEN_KEYS.session, data.token);
  }

  localStorage.removeItem(TOKEN_KEYS.pre2fa);

  return data;
};

const getToken = () => localStorage.getItem(TOKEN_KEYS.session);
const getFirstLoginToken = () => localStorage.getItem(TOKEN_KEYS.firstLogin);
const getPre2faToken = () => localStorage.getItem(TOKEN_KEYS.pre2fa);

const logoutService = () => {
  clearAuthStorage();
};

export {
  loginService,
  activateTwoFactorAuthService,
  verify2FAService,
  skip2FAService,
  changePasswordService,
  getToken,
  getFirstLoginToken,
  getPre2faToken,
  logoutService,
  validateLogin2FAService,
  getReadableErrors,
};
