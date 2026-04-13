const API_URL = "http://localhost:3000";

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
    throw new Error(data.message || "Error al iniciar sesión");
  }

  if (data.tempToken) {
    localStorage.setItem("tempToken", data.tempToken);
  }

  if (data.token) {
    localStorage.setItem("token", data.token);
  }

  return data;
};

const activateTwoFactorAuthService = async () => {
  const tempToken = getTempToken();

  const response = await fetch(`${API_URL}/users/2fa/setup`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${tempToken}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Error al generar QR");
  }

  return data;
};

const verify2FAService = async (code) => {
  const tempToken = getTempToken();

  const response = await fetch(`${API_URL}/users/2fa/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${tempToken}`,
    },
    body: JSON.stringify({ code }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Código inválido");
  }

  if (data.token) {
    localStorage.setItem("token", data.token);
    localStorage.removeItem("tempToken");
  }

  return data;
};

const skip2FAService = async () => {
  const tempToken = getTempToken();

  const response = await fetch(`${API_URL}/users/2fa/skip`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${tempToken}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Error al omitir 2FA");
  }

  if (data.token) {
    localStorage.setItem("token", data.token);
    localStorage.removeItem("tempToken");
  }

  return data;
};

const getToken = () => localStorage.getItem("token");
const getTempToken = () => localStorage.getItem("tempToken");

const logoutService = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("tempToken");
};

export {
  loginService,
  activateTwoFactorAuthService,
  verify2FAService,
  skip2FAService,
  getToken,
  getTempToken,
  logoutService,
};