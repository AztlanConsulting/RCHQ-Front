export const getDocumentLabel = (typeValue, documentTypes = []) => {
  const found = documentTypes.find((dt) => dt.value === typeValue);
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

export const getDocumentFileNameFromLink = (link = "") => {
  const path = String(link).split(/[?#]/)[0];
  const parts = path.split(/[\\/]/).filter(Boolean);
  const fileName = parts[parts.length - 1] ?? "";

  try {
    return decodeURIComponent(fileName);
  } catch {
    return fileName;
  }
};

export const isDocumentPdf = (doc) => {
  const url = doc?.fileUrl || doc?.url || "";
  const mime = doc?.mimeType || doc?.fileType || "";
  return url.toLowerCase().endsWith(".pdf") || mime.includes("pdf");
};
