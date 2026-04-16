const API_URL = "http://localhost:3000";

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

  if (err?.message) {
    return [err.message];
  }

  return ["Ocurrió un error inesperado"];
};

const TOKEN_KEYS = {
  session: "token",
};

const clearAuthStorage = () => {
  localStorage.removeItem(TOKEN_KEYS.session);
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

export {
  loginService,
  getToken,
  logoutService,
  getReadableErrors,
};