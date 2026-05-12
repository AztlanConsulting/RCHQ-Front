const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const buildApiError = (response, data, fallbackMessage) => {
  const errorMessage = new Error(data?.message || fallbackMessage);
  errorMessage.status = response.status;
  errorMessage.code = data?.code;
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

const getUserData = async (token) => {
  try{
    const response = await fetch(`${API_URL}/user/profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    throw new Error("Error al obtener los datos del usuario.");
  }

  try{
    const data = await response.json();
  }
    catch (error) {
    throw new Error("Error al procesar los datos del usuario.");
  }

  if (!response.ok) {
    const fallbackMessages = {
      401: "No tienes permisos para ver esta información.",
      404: "Ruta no encontrada.",
      501: "Ocurrió un problema al obtener la información.",
    };
    throw buildApiError(
      response,
      data,
      fallbackMessages[response.status] ?? "Error desconocido."
    );
  }

  return data;
};

export { getUserData, getReadableErrors };