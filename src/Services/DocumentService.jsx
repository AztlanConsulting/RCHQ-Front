const API_URL = "http://localhost:3000";

const buildApiError = (response, data, fallbackMessage) => {
  const errorMessage = new Error(data?.message || fallbackMessage);
  errorMessage.status = response.status;
  errorMessage.code = data?.code;
  errorMessage.data = data?.data;
  errorMessage.errors = Array.isArray(data?.errors) ? data.errors : [];
  return errorMessage;
};

const getToken = () => localStorage.getItem("token");

export const DOCUMENT_TYPES = [
  { value: "evaluacion_psicologica", label: "Evaluación Psicológica" },
  { value: "evaluacion_psicometrica", label: "Evaluación Psicométrica" },
  { value: "certificado_educacion", label: "Certificado en Educación" },
  { value: "acta_nacimiento", label: "Acta de Nacimiento" },
  { value: "identificacion_oficial", label: "Identificación Oficial" },
  { value: "comprobante_domicilio", label: "Comprobante de Domicilio" },
  { value: "curp", label: "CURP" },
  { value: "rfc", label: "RFC" },
  { value: "nss", label: "Número de Seguridad Social" },
  { value: "carta_recomendacion", label: "Carta de Recomendación" },
  { value: "contrato", label: "Contrato" },
  { value: "otro", label: "Otro" },
];

export const getDocumentsService = async () => {
  const token = getToken();
  if (!token) throw new Error("No se encontró token de sesión");

  const response = await fetch(`${API_URL}/documents`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw buildApiError(response, data, "Error al obtener los documentos");
  }
  return data;
};

export const uploadDocumentService = async (formData) => {
  const token = getToken();
  if (!token) throw new Error("No se encontró token de sesión");

  const response = await fetch(`${API_URL}/documents`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw buildApiError(response, data, "Error al subir el documento");
  }
  return data;
};

export const updateDocumentService = async (documentId, formData) => {
  const token = getToken();
  if (!token) throw new Error("No se encontró token de sesión");

  const response = await fetch(`${API_URL}/documents/${documentId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw buildApiError(response, data, "Error al actualizar el documento");
  }
  return data;
};

export const deleteDocumentService = async (documentId) => {
  const token = getToken();
  if (!token) throw new Error("No se encontró token de sesión");

  const response = await fetch(`${API_URL}/documents/${documentId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw buildApiError(response, data, "Error al eliminar el documento");
  }
  return data;
};