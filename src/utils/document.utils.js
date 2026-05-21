import { DOCUMENT_TYPES } from "../services/documentService";

class DocumentUtils {
  static getDocumentLabel(typeValue) {
    const found = DOCUMENT_TYPES.find((dt) => dt.value === typeValue);
    return found ? found.label : typeValue;
  }

  static formatDocumentDate(dateString) {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("es-MX", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
    });
  }

  static getDocumentFileUrl(doc) {
    return doc.fileUrl || doc.url || null;
  }

  static isDocumentPdf(doc) {
    const url = doc?.fileUrl || doc?.url || "";
    const mime = doc?.mimeType || doc?.fileType || "";
    return url.toLowerCase().endsWith(".pdf") || mime.includes("pdf");
  }
}

export default DocumentUtils;
