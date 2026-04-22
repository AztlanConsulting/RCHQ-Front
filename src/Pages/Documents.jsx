import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Alert from "../Components/Atoms/Alerts";
import Button from "../Components/Atoms/Button";
import DocumentCard from "../Components/Molecules/DocumentCard.jsx";
import DocumentUploadModal from "../Components/Organism/DocumentsUploads";
import ConfirmDeleteModal from "../Components/Organism/ConfirmDeleteModal";
import {
  getDocumentsService,
  uploadDocumentService,
  updateDocumentService,
  deleteDocumentService,
} from "../Services/DocumentService";

// ─── Page ──────────────────────────────────────────────────────────────────────

const Documents = () => {
  const navigate = useNavigate();

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

  // Auto-clear success
  useEffect(() => {
    if (!successMessage) return;
    const t = setTimeout(() => setSuccessMessage(""), 4000);
    return () => clearTimeout(t);
  }, [successMessage]);

  // Fetch documents on mount
  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setLoadingDocs(true);
    setFetchError("");
    try {
      const response = await getDocumentsService();
      setDocuments(response?.data || response || []);
    } catch (err) {
      setFetchError(err.message || "Error al cargar los documentos");
    } finally {
      setLoadingDocs(false);
    }
  };

  // Upload / Edit submit
  const handleModalSubmit = async (formData) => {
    setModalLoading(true);
    setModalError("");
    try {
      if (editingDocument) {
        await updateDocumentService(editingDocument.id, formData);
        setSuccessMessage("Documento actualizado correctamente.");
      } else {
        await uploadDocumentService(formData);
        setSuccessMessage("Documento subido correctamente.");
      }
      setShowUploadModal(false);
      setEditingDocument(null);
      fetchDocuments();
    } catch (err) {
      setModalError(err.message || "Error al guardar el documento");
    } finally {
      setModalLoading(false);
    }
  };

  const handleOpenEdit = (doc) => {
    setEditingDocument(doc);
    setModalError("");
    setShowUploadModal(true);
  };

  const handleOpenUpload = () => {
    setEditingDocument(null);
    setModalError("");
    setShowUploadModal(true);
  };

  const handleCloseModal = () => {
    setShowUploadModal(false);
    setEditingDocument(null);
    setModalError("");
  };

  // Delete
  const handleDeleteConfirm = async () => {
    if (!docToDelete) return;
    setDeletingId(docToDelete.id);
    try {
      await deleteDocumentService(docToDelete.id);
      setDocuments((prev) => prev.filter((d) => d.id !== docToDelete.id));
      setSuccessMessage("Documento eliminado correctamente.");
    } catch (err) {
      setFetchError(err.message || "Error al eliminar el documento");
    } finally {
      setDeletingId(null);
      setDocToDelete(null);
    }
  };

  return (
    <div className="p-8">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Documentación</h1>
        <Button
          text="Subir Documento"
          onClick={handleOpenUpload}
          bgColor="bg-[#1e2b4d]"
          hoverColor="hover:bg-[#15203b]"
          activeColor="active:bg-[#0f172a]"
          textColor="text-white"
          width="w-auto"
          height="h-[44px]"
          textSize="text-sm"
          fontWeight="font-semibold"
          className="px-5"
        />
      </div>

      {/* Alerts */}
      {successMessage && (
        <div className="mb-4">
          <Alert type="success" message={successMessage} />
        </div>
      )}
      {fetchError && (
        <div className="mb-4">
          <Alert type="error" message={fetchError} />
        </div>
      )}

      {/* Content card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 min-h-64">
        {loadingDocs ? (
          <div className="flex items-center justify-center h-40">
            <p className="text-sm text-slate-400 animate-pulse">Cargando documentos...</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-3">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <p className="text-sm text-slate-400">No hay documentos subidos aún.</p>
            <button
              onClick={handleOpenUpload}
              className="text-sm font-semibold text-[#1e2b4d] hover:underline"
            >
              Subir el primero
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-5">
            {documents.map((doc) => (
              <DocumentCard
                key={doc.id}
                doc={doc}
                onEdit={handleOpenEdit}
                onDelete={setDocToDelete}
                deleting={deletingId}
              />
            ))}
          </div>
        )}
      </div>

      {/* Back button */}
      <div className="mt-6">
        <Button
          text="Regresar a opciones"
          onClick={() => navigate("/app/opciones")}
          bgColor="bg-transparent"
          hoverColor="hover:bg-slate-100"
          activeColor="active:bg-slate-200"
          textColor="text-slate-600"
          width="w-auto"
          height="h-[40px]"
          textSize="text-sm"
          fontWeight="font-medium"
          className="px-4 border border-slate-200"
        />
      </div>

      {/* Upload / Edit modal */}
      <DocumentUploadModal
        isOpen={showUploadModal}
        onClose={handleCloseModal}
        onSubmit={handleModalSubmit}
        editingDocument={editingDocument}
        loading={modalLoading}
        error={modalError}
      />

      {/* Delete confirm modal */}
      <ConfirmDeleteModal
        doc={docToDelete}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDocToDelete(null)}
        loading={Boolean(deletingId)}
      />
    </div>
  );
};

export default Documents;