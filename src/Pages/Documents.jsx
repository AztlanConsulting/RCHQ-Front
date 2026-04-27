// src/Pages/Documents.jsx
import { useParams } from "react-router-dom";
import DocumentsSection from "../Components/Organism/DocumentsSection";
import { useDocuments } from "../hooks/Organism/useDocuments";
import { DOCUMENT_TYPES } from "../Services/DocumentService";

const Documents = () => {
  const { employeeId } = useParams();
  const {
    // Organism
    documents,
    loadingDocs,
    fetchError,
    showUploadModal,
    modalLoading,
    modalError,
    docToDelete,
    deletingId,
    successMessage,
    canModify,
    conflictDocument,
    setDocToDelete,
    handleDeleteConfirm,
    handleOpenEdit,
    handleOpenUpload,
    handleCloseModal,
    handleConflictConfirm,
    handleConflictCancel,
    // Modal (antes molecule)
    isEditing,
    documentType,
    fileName,
    handleFileChange,
    displayError,
    handleModalSubmit,
  } = useDocuments(employeeId);

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
      handleSubmit={handleModalSubmit}
      handleOpenEdit={handleOpenEdit}
      setDocToDelete={setDocToDelete}
      handleDeleteConfirm={handleDeleteConfirm}
      handleConflictConfirm={handleConflictConfirm}
      handleConflictCancel={handleConflictCancel}
    />
  );
};

export default Documents;
