import { useState, useEffect, useCallback } from "react";
import {
  getDocumentsService,
  uploadDocumentService,
  updateDocumentService,
  deleteDocumentService,
} from "../../Services/DocumentService";

const getUserInfoFromToken = () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return {
      role: payload.role,
      id: payload.id,
    };
  } catch (error) {
    console.error("error: ", error);
  }
};

export const useDocuments = (employeeId) => {
  const [documents, setDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingDocument, setEditingDocument] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");
  const [docToDelete, setDocToDelete] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [canModify, setCanModify] = useState(false);
  const [conflictDocument, setConflictDocument] = useState(null);

  useEffect(() => {
    const userInfo = getUserInfoFromToken();
    if (!userInfo) return;
    const userRole = userInfo.role?.toLowerCase();
    if (userRole === "administrador" || userRole === "coordinador") {
      setCanModify(true);
    } else {
      setCanModify(false);
    }
  }, [employeeId]);

  useEffect(() => {
    if (!successMessage) return;
    const t = setTimeout(() => setSuccessMessage(""), 4000);
    return () => clearTimeout(t);
  }, [successMessage]);

  const fetchDocuments = useCallback(async () => {
    setLoadingDocs(true);
    setFetchError("");
    try {
      const response = await getDocumentsService(employeeId);
      const docRow = response?.body;

      if (!docRow || !docRow.documents) {
        setDocuments([]);
        return;
      }
      
      const BASEURL = import.meta.env.VITE_API_URL?.replace(/\/$/, "");
      const docsArray = Object.entries(docRow.documents)
        .filter(([key, value]) => key !== "document_id" && value !== null && value !== "")
        .map(([type, url]) => ({ type, url: `${BASEURL}/${url}` }));

      setDocuments(docsArray);
    } catch (err) {
      setFetchError(err.message || "Error al cargar los documentos");
    } finally {
      setLoadingDocs(false);
    }
  }, [employeeId]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleModalSubmit = useCallback(async (formData) => {
    if (!canModify) {
      setModalError("Operación denegada. No tienes permisos para modificar.");
      return;
    }

    setModalLoading(true);
    setModalError("");
    try {
      if (editingDocument) {
        await updateDocumentService(employeeId, editingDocument.type, formData);
        setSuccessMessage("Documento actualizado correctamente.");
      } else {
        await uploadDocumentService(employeeId, formData);
        setSuccessMessage("Documento subido correctamente.");
      }
      setShowUploadModal(false);
      setEditingDocument(null);
      fetchDocuments();
    } catch (err) {
      if (err.status === 409) {
        const field = err.field || formData.get("documentField");
        setConflictDocument({ field, formData });
        setShowUploadModal(false);
      } else if (err.status === 403) {
        setModalError("No tienes permisos para realizar esta acción.");
      } else {
        setModalError(err.message || "Error al guardar el documento");
      }
    } finally {
      setModalLoading(false);
    }
  }, [employeeId, editingDocument, fetchDocuments, canModify]);

  const handleConflictConfirm = useCallback(async () => {
    if (!conflictDocument) return;
    setModalLoading(true);
    try {
      await updateDocumentService(employeeId, conflictDocument.field, conflictDocument.formData);
      setSuccessMessage("Documento reemplazado correctamente.");
      fetchDocuments();
    } catch (err) {
      setFetchError(err.message || "Error al reemplazar el documento");
    } finally {
      setModalLoading(false);
      setConflictDocument(null);
    }
  }, [employeeId, conflictDocument, fetchDocuments]);

  const handleConflictCancel = useCallback(() => {
    setConflictDocument(null);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!canModify) return;
    if (!docToDelete) return;
    setDeletingId(docToDelete.type);
    try {
      await deleteDocumentService(employeeId, docToDelete.type);
      setDocuments((prev) => prev.filter((d) => d.type !== docToDelete.type));
      setSuccessMessage("Documento eliminado correctamente.");
    } catch (err) {
      setFetchError(err.message || "Error al eliminar el documento");
    } finally {
      setDeletingId(null);
      setDocToDelete(null);
    }
  }, [employeeId, docToDelete, canModify]);

  const handleOpenEdit = useCallback((doc) => {
    if (!canModify) return;
    setEditingDocument(doc);
    setModalError("");
    setShowUploadModal(true);
  }, [canModify]);

  const handleOpenUpload = useCallback(() => {
    if (!canModify) return;
    setEditingDocument(null);
    setModalError("");
    setShowUploadModal(true);
  }, [canModify]);

  const handleCloseModal = useCallback(() => {
    setShowUploadModal(false);
    setEditingDocument(null);
    setModalError("");
  }, []);

  return {
    documents,
    loadingDocs,
    fetchError,
    showUploadModal,
    editingDocument,
    modalLoading,
    modalError,
    docToDelete,
    deletingId,
    successMessage,
    canModify,
    conflictDocument,
    setDocToDelete,
    handleModalSubmit,
    handleDeleteConfirm,
    handleOpenEdit,
    handleOpenUpload,
    handleCloseModal,
    handleConflictConfirm,
    handleConflictCancel,
  };
};