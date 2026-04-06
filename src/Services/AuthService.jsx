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

  // guardar token (si existe)
  if (data.token) {
    localStorage.setItem("token", data.token);
  }

  return data;
};

const getToken = () => localStorage.getItem("token");

const validateSession = async () => {
  // call backend to validate the token?
  const validSession = true;

  return validSession;
};

const logoutService = async () => {
  localStorage.removeItem('token');
};

export {
  loginService,
  getToken,
  validateSession,
  logoutService,
};