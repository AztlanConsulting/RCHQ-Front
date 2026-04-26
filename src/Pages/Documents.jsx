// src/Pages/Documents.jsx
import { useParams } from "react-router-dom";
import DocumentsSection from "../Components/Organism/DocumentsSection";
import { useDocuments } from "../hooks/Organism/useDocuments";
import { useDocumentUploadModal } from "../hooks/Molecules/useDocumentUploadModal";
import { DOCUMENT_TYPES } from "../Services/DocumentService";

const Documents = () => {
  const { employeeId } = useParams();

  const {
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
  } = useDocuments(employeeId);

  const {
    isEditing,
    documentType,
    fileName,
    handleFileChange,
    handleSubmit,
    displayError,
  } = useDocumentUploadModal({
    editingDocument,
    isOpen: showUploadModal,
    onSubmit: handleModalSubmit,
  });

  return (
    <DocumentsSection
      // datos
      documents={documents}
      loadingDocs={loadingDocs}
      fetchError={fetchError}
      successMessage={successMessage}
      canModify={canModify}
      deletingId={deletingId}
      docToDelete={docToDelete}
      conflictDocument={conflictDocument}
      // modal de subida
      showUploadModal={showUploadModal}
      isEditing={isEditing}
      documentType={documentType}
      fileName={fileName}
      displayError={displayError}
      modalError={modalError}
      modalLoading={modalLoading}
      // handlers
      handleOpenUpload={handleOpenUpload}
      handleCloseModal={handleCloseModal}
      handleFileChange={handleFileChange}
      handleSubmit={handleSubmit}
      handleOpenEdit={handleOpenEdit}
      setDocToDelete={setDocToDelete}
      handleDeleteConfirm={handleDeleteConfirm}
      handleConflictConfirm={handleConflictConfirm}
      handleConflictCancel={handleConflictCancel}
    />
  );
};

export default Documents;