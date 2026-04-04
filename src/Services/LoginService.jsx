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

export default loginService;