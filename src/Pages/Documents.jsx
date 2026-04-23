import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

const Documents = () => {
  const { employeeId } = useParams();
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

  useEffect(() => {
    if (!successMessage) return;
    const t = setTimeout(() => setSuccessMessage(""), 4000);
    return () => clearTimeout(t);
  }, [successMessage]);

  useEffect(() => {
    fetchDocuments();
  }, [employeeId]);

  const fetchDocuments = async () => {
    setLoadingDocs(true);
    setFetchError("");
    try {
      const response = await getDocumentsService(employeeId);
      const docRow = response?.data;

      if (!docRow || !docRow.documents) {
        setDocuments([]);
        return;
      }

      // Convierte el objeto de documentos en array de { type, url }
    const docsArray = Object.entries(docRow.documents)
    .filter(([key, value]) => key !== "document_id" && value !== null && value !== "")
    .map(([type, url]) => ({
        type,
        url: `http://localhost:3000/${url}`, // ✅ agrega el servidor
    }));

      setDocuments(docsArray);
    } catch (err) {
      setFetchError(err.message || "Error al cargar los documentos");
    } finally {
      setLoadingDocs(false);
    }
  };

  const handleModalSubmit = async (formData) => {
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
      setModalError(err.message || "Error al guardar el documento");
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
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

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Documentos</h1>
        <Button
          text="+ Subir documento"
          onClick={handleOpenUpload}
          bgColor="bg-[#1e2b4d]"
          hoverColor="hover:bg-[#15203b]"
          textColor="text-white"
          width="w-auto"
          height="h-[42px]"
          textSize="text-sm"
          fontWeight="font-semibold"
          className="px-5"
        />
      </div>

      {/* Alertas */}
      {successMessage && <Alert type="success" message={successMessage} />}
      {fetchError && <Alert type="error" message={fetchError} />}

      {/* Contenido */}
      {loadingDocs ? (
        <p className="text-slate-500 text-sm">Cargando documentos...</p>
      ) : documents.length === 0 ? (
        <p className="text-slate-400 text-sm">
          Este empleado aún no tiene documentos.
        </p>
      ) : (
        <div className="flex flex-wrap gap-4">
          {documents.map((doc) => (
            <DocumentCard
              key={doc.type || doc.document_id}
              doc={doc}
              onEdit={handleOpenEdit}
              onDelete={setDocToDelete}
              deleting={deletingId}
            />
          ))}
        </div>
      )}

      {/* Modales */}
      <DocumentUploadModal
        isOpen={showUploadModal}
        onClose={handleCloseModal}
        onSubmit={handleModalSubmit}
        editingDocument={editingDocument}
        loading={modalLoading}
        error={modalError}
      />
      <ConfirmDeleteModal
        doc={docToDelete}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDocToDelete(null)}
        loading={!!deletingId}
      />
    </div>
  );
};

export default Documents;
