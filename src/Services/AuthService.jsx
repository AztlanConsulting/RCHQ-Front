const API_URL = "http://localhost:3000";

const buildApiError = (response, data, fallbackMessage) => {
  const errorMessage = new Error(data?.message || fallbackMessage);
  errorMessage.status = response.status;
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

const TOKEN_KEYS = {
  session: "token",
  // firstLogin: "firstLoginToken",
  // pre2fa: "pre2faToken",
};

const clearAuthStorage = () => {
  localStorage.removeItem(TOKEN_KEYS.session);
  // localStorage.removeItem(TOKEN_KEYS.firstLogin);
  // localStorage.removeItem(TOKEN_KEYS.pre2fa);

  localStorage.removeItem("user");
};

const saveLoginSession = (responseData) => {
  clearAuthStorage();

  const token = responseData?.data?.token;
  const user = responseData?.data?.user;

  if (token) {
    localStorage.setItem(TOKEN_KEYS.session, token);
  }

  if (user) {
    localStorage.setItem("user", JSON.stringify(user));
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
    throw buildApiError(response, data, "Error al iniciar sesión");
  }

  saveLoginSession(data);

  return data;
};

const getToken = () => localStorage.getItem(TOKEN_KEYS.session);

const logoutService = () => {
  clearAuthStorage();
};

/* Fuera de alcance de la us 3
const getFirstLoginToken = () => localStorage.getItem("firstLoginToken");
const getPre2faToken = () => localStorage.getItem("pre2faToken");

const skip2FAService = async () => {};
const changePasswordService = async () => {};
const validateLogin2FAService = async () => {};
*/

const activateTwoFactorAuthService = async () => {
  const token = getToken();
  const id = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")).employeeId : null;

  console.log("Activando 2FA para employeeId:", id); // ← agrega esto

  if (!token) {
    throw new Error("No se encontró token de sesión");
  }

  const response = await fetch(`${API_URL}/users/2fa/setup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ id: id }),
  });
  const data = await response.json();

  if (!response.ok) {
    throw buildApiError(response, data, "Error al activar la autenticación de dos factores");
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
    throw buildApiError(response, data, "Error al verificar el código de autenticación de dos factores");
  }

  return data;
};


export {
  loginService,
  getToken,
  logoutService,
  getReadableErrors,
  activateTwoFactorAuthService,
  verify2FAService,
};