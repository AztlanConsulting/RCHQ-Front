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
  { value: "cv", label: "CV" },
  { value: "birth_certificate", label: "Acta de Nacimiento" },
  { value: "tax_status_certificate", label: "Constancia de Situación Fiscal" },
  { value: "address_certificate", label: "Comprobante de Domicilio" },
  { value: "nss", label: "NSS" },
  { value: "professional_id", label: "Cédula Profesional" },
  { value: "education_certificate", label: "Certificado de Educación" },
  { value: "medical_certificate", label: "Certificado Médico" },
  {
    value: "state_criminal_record_certificate",
    label: "Antecedentes Penales Estatales",
  },
  {
    value: "federal_criminal_record_certificate",
    label: "Antecedentes Penales Federales",
  },
  {
    value: "first_recommendation_letter",
    label: "Primera Carta de Recomendación",
  },
  {
    value: "second_recommendation_letter",
    label: "Segunda Carta de Recomendación",
  },
  { value: "driver_license", label: "Licencia de Conducir" },
  { value: "signed_regulation", label: "Reglamento Firmado" },
  { value: "signed_contract", label: "Contrato Firmado" },
  {
    value: "signed_confidential_letter",
    label: "Carta de Confidencialidad Firmada",
  },
  { value: "signed_ethics_letter", label: "Carta de Ética Firmada" },
  { value: "induction_manual", label: "Manual de Inducción" },
];

export const getDocumentsService = async (employeeId) => {
  const token = getToken();
  if (!token) throw new Error("No se encontró token de sesión");

  const response = await fetch(`${API_URL}/employee/${employeeId}/documents`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw buildApiError(response, data, "Error al obtener los documentos");
  }
  return data;
};

export const uploadDocumentService = async (employeeId, formData) => {
  const token = getToken();
  if (!token) throw new Error("No se encontró token de sesión");

  const response = await fetch(`${API_URL}/employee/${employeeId}/documents`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      // NO poner Content-Type con multipart/form-data — el browser lo setea solo
    },
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw buildApiError(response, data, "Error al subir el documento");
  }
  return data;
};

export const updateDocumentService = async (
  employeeId,
  documentField,
  formData,
) => {
  const token = getToken();
  if (!token) throw new Error("No se encontró token de sesión");

  const response = await fetch(
    `${API_URL}/employee/${employeeId}/documents/${documentField}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    },
  );

  const data = await response.json();
  if (!response.ok) {
    throw buildApiError(response, data, "Error al actualizar el documento");
  }
  return data;
};

export const deleteDocumentService = async (employeeId, documentField) => {
  const token = getToken();
  if (!token) throw new Error("No se encontró token de sesión");

  const response = await fetch(
    `${API_URL}/employee/${employeeId}/documents/${documentField}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const data = await response.json();
  if (!response.ok) {
    throw buildApiError(response, data, "Error al eliminar el documento");
  }
  return data;
};
