import { useState, useEffect, useCallback } from "react";
import {
  getDocumentsService,
  uploadDocumentService,
  updateDocumentService,
  deleteDocumentService,
} from "../../Services/DocumentService";

// ✅ Helper privado del hook para decodificar el token
const getUserInfoFromToken = () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return {
      role: payload.role, // Ajustar según cómo se llame en tu JWT (ej. 'rol')
      id: payload.id      // Ajustar según cómo se llame en tu JWT
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
  
  // ✅ Nuevo estado para la vista
  const [canModify, setCanModify] = useState(false);

  // ✅ Calcular permisos al cargar el hook
  useEffect(() => {
    const userInfo = getUserInfoFromToken();
    const userRole = userInfo.role?.toLowerCase();
    if (userInfo) {
      if (userRole === "administrador" || userRole === "coordinador") {
        setCanModify(true);
      } else {
        // Si es empleado normal o es su propio id, solo lee
        setCanModify(false);
      }
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

      const docsArray = Object.entries(docRow.documents)
        .filter(([key, value]) => key !== "document_id" && value !== null && value !== "")
        .map(([type, url]) => ({ type, url: `http://localhost:3000/${url}` }));

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

  // ✅ Validamos canModify antes de permitir acciones
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
      if (err.status === 403) {
        setModalError("No tienes permisos para realizar esta acción.");
      } else {
        setModalError(err.message || "Error al guardar el documento");
      }
    } finally {
      setModalLoading(false);
    }
  }, [employeeId, editingDocument, fetchDocuments, canModify]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!canModify) return; // ✅ Bloqueo de seguridad

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
    if (!canModify) return; // ✅ Bloqueo de seguridad
    setEditingDocument(doc);
    setModalError("");
    setShowUploadModal(true);
  }, [canModify]);

  const handleOpenUpload = useCallback(() => {
    if (!canModify) return; // ✅ Bloqueo de seguridad
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
    canModify, // ✅ Exportamos la bandera para la vista
    setDocToDelete,
    handleModalSubmit,
    handleDeleteConfirm,
    handleOpenEdit,
    handleOpenUpload,
    handleCloseModal,
  };
};