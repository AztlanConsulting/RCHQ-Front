const API_URL = import.meta.env.VITE_API_URL;

const buildApiError = (response, data, fallbackMessage) => {
  const errorMessage = new Error(data?.message || fallbackMessage);
  errorMessage.status = response.status;
  errorMessage.field = data?.field;
  return errorMessage;
};

const getToken = () => localStorage.getItem("token");

export const getDocumentTypesService = async () => {
  const token = getToken();
  const response = await fetch(`${API_URL}/employee/document-types`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) throw buildApiError(response, data, "Error al obtener tipos de documento");
  return data.data.map((d) => ({ value: d.document_id, label: d.name }));
};

export const getDocumentsService = async (employeeId) => {
  const token = getToken();
  const response = await fetch(`${API_URL}/employee/${employeeId}/documents`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) throw buildApiError(response, data, "Error al obtener los documentos");
  return {
      ...data,
      data: data.data?.map((doc) => ({
        ...doc,
        url: `${API_URL}/${doc.url}`,
      })),
    };
  };

export const uploadDocumentService = async (employeeId, formData) => {
  const token = getToken();
  const response = await fetch(`${API_URL}/employee/${employeeId}/documents`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) throw buildApiError(response, data, "Error al subir el documento");
  return data;
};

export const updateDocumentService = async (employeeId, documentId, formData) => {
  const token = getToken();
  const response = await fetch(`${API_URL}/employee/${employeeId}/documents/${documentId}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) throw buildApiError(response, data, "Error al actualizar el documento");
  return data;
};

export const deleteDocumentService = async (employeeId, documentId) => {
  const token = getToken();
  const response = await fetch(`${API_URL}/employee/${employeeId}/documents/${documentId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) throw buildApiError(response, data, "Error al eliminar el documento");
  return data;
};