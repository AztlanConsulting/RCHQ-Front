class Documents {
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

export default Documents;
