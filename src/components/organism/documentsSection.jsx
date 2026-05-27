import Alert from "../atoms/alerts";
import BigButton from "../atoms/bigButton";
import DocumentCard from "../molecules/documentCard";
import DocumentUploadModal from "../molecules/documentsUploads";
import ConfirmDeleteModal from "../molecules/confirmDeleteModal";

const formatDocumentDate = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("es-MX", {
    day: "numeric", month: "numeric", year: "numeric",
  });
};

const isDocumentPdf = (doc) => {
  const url = doc?.url || "";
  return url.toLowerCase().endsWith(".pdf");
};

const DocumentsSection = ({
  documents,
  documentTypes,
  loadingDocs,
  fetchError,
  successMessage,
  canModify,
  deletingId,
  docToDelete,
  conflictDocument,
  showUploadModal,
  isEditing,
  documentType,
  fileName,
  displayError,
  modalError,
  modalLoading,
  handleOpenUpload,
  handleCloseModal,
  handleFileChange,
  handleModalSubmit,
  handleOpenEdit,
  setDocToDelete,
  handleDeleteConfirm,
  handleConflictConfirm,
  handleConflictCancel,
}) => {
  return (
    <div className="p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="min-w-0 text-xl font-bold text-slate-900 sm:text-2xl">
          Documentos
        </h1>
        {canModify && (
          <BigButton
            text="+ Subir documento"
            onClick={handleOpenUpload}
            className="h-[42px] min-w-0 px-5 text-sm"
          />
        )}
      </div>

      {successMessage && <Alert type="success" message={successMessage} />}
      {fetchError && <Alert type="error" message={fetchError} />}

      {loadingDocs ? (
        <p className="text-slate-500 text-sm">Cargando documentos...</p>
      ) : documents.length === 0 ? (
        <p className="text-slate-400 text-sm">Este empleado aún no tiene documentos.</p>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-6">
          {documents.map((doc) => (
            <DocumentCard
              key={doc.documentId}
              doc={doc}
              label={doc.name}
              date={formatDocumentDate(doc.uploadedAt)}
              fileUrl={doc.url}
              isPdf={isDocumentPdf(doc)}
              onEdit={handleOpenEdit}
              onDelete={setDocToDelete}
              isBeingDeleted={deletingId === doc.documentId}
              canModify={canModify}
            />
          ))}
        </div>
      )}

      <DocumentUploadModal
        isOpen={showUploadModal}
        onClose={handleCloseModal}
        isEditing={isEditing}
        documentTypeValue={documentType.value}
        setDocumentType={documentType.handleValue}
        documentOptions={documentTypes}
        fileName={fileName}
        handleFileChange={handleFileChange}
        handleSubmit={handleModalSubmit}
        displayError={displayError || modalError}
        loading={modalLoading}
      />

      <ConfirmDeleteModal
        label={docToDelete?.name ?? null}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDocToDelete(null)}
        loading={!!deletingId}
        mode="delete"
      />

      <ConfirmDeleteModal
        label={
          conflictDocument
            ? documentTypes.find((d) => d.value === conflictDocument.field)?.label ?? null
            : null
        }
        onConfirm={handleConflictConfirm}
        onCancel={handleConflictCancel}
        loading={modalLoading}
        mode="replace"
      />
    </div>
  );
};

export default DocumentsSection;
