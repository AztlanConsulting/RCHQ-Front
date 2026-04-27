import { DOCUMENT_TYPES } from "../Services/DocumentService";

export const getDocumentLabel = (typeValue) => {
  const found = DOCUMENT_TYPES.find((dt) => dt.value === typeValue);
  return found ? found.label : typeValue;
};

export const formatDocumentDate = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });
};

export const getDocumentFileUrl = (doc) => doc.fileUrl || doc.url || null;

export const isDocumentPdf = (doc) => {
  const url = doc?.fileUrl || doc?.url || "";
  const mime = doc?.mimeType || doc?.fileType || "";
  return url.toLowerCase().endsWith(".pdf") || mime.includes("pdf");
};
