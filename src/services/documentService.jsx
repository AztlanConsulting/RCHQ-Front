import { secureFetch } from "../utils/secureFetchWrapper";

const API_URL = import.meta.env.VITE_API_URL;

const buildApiError = (response, data, fallbackMessage) => {
  const errorMessage = new Error(data?.message || fallbackMessage);
  errorMessage.status = response.status;
  errorMessage.field = data?.field;
  return errorMessage;
};

export const getDocumentTypesService = async () => {
  const response = await secureFetch(`/employee/document-types`);
  const data = await response.json();
  if (!response.ok) throw buildApiError(response, data, "Error al obtener tipos de documento");
  return data.data.map((d) => ({ value: d.document_id, label: d.name }));
};

export const getDocumentsService = async (employeeId) => {
  const response = await secureFetch(`/employee/${employeeId}/documents`);
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
  const response = await secureFetch(`/employee/${employeeId}/documents`, {
    method: "POST",
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) throw buildApiError(response, data, "Error al subir el documento");
  return data;
};

export const updateDocumentService = async (employeeId, documentId, formData) => {
  const response = await secureFetch(`/employee/${employeeId}/documents/${documentId}`, {
    method: "PUT",
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) throw buildApiError(response, data, "Error al actualizar el documento");
  return data;
};

export const deleteDocumentService = async (employeeId, documentId) => {
  const response = await secureFetch(`/employee/${employeeId}/documents/${documentId}`, {
    method: "DELETE",
  });
  const data = await response.json();
  if (!response.ok) throw buildApiError(response, data, "Error al eliminar el documento");
  return data;
};