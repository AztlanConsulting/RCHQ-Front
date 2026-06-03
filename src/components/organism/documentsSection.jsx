import { useLocation, useNavigate, matchPath } from "react-router-dom";
import Alert from "../atoms/alerts";
import BigButton from "../atoms/bigButton";
import DocumentCard from "../molecules/documentCard";
import DocumentUploadModal from "../molecules/documentsUploads";
import ConfirmDeleteModal from "../molecules/confirmDeleteModal";

const formatDocumentDate = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
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
  onFetchErrorClose,
  successMessage,
  onSuccessMessageClose,
  canModify,
  deletingId,
  docToDelete,
  conflictDocument,
  showUploadModal,
  isEditing,
  documentType,
  fileName,
  displayError,
  onUploadErrorClose,
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
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const showDocumentsPageBack =
    matchPath({ path: "/app/:employeeId/documentos", end: true }, pathname) !=
    null;

  return (
    <div className="p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {showDocumentsPageBack ? (
            <button
              type="button"
              onClick={() => navigate("/app/opciones")}
              className="rounded-lg p-2 hover:bg-slate-100 transition-colors shrink-0"
            >
              <svg
                className="w-5 h-5 text-slate-600 rotate-90"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          ) : null}
          <h1 className="text-2xl font-bold text-slate-900">Documentos</h1>
        </div>
        {canModify && (
          <BigButton
            text={
              <>
                <span className="min-[451px]:hidden">+</span>
                <span className="hidden min-[451px]:inline">
                  + Subir documento
                </span>
              </>
            }
            onClick={handleOpenUpload}
            className="h-[42px] min-w-[42px] px-0 text-sm min-[451px]:min-w-0 min-[451px]:px-5"
          />
        )}
      </div>

      {successMessage && (
        <Alert
          type="success"
          message={successMessage}
          onClose={onSuccessMessageClose}
        />
      )}
      {fetchError && (
        <Alert type="error" message={fetchError} onClose={onFetchErrorClose} />
      )}

      {loadingDocs ? (
        <p className="text-slate-500 text-sm">Cargando documentos...</p>
      ) : documents.length === 0 ? (
        <p className="text-slate-400 text-sm">
          Este empleado aún no tiene documentos.
        </p>
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
        onDisplayErrorClose={onUploadErrorClose}
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
            ? (documentTypes.find((d) => d.value === conflictDocument.field)
                ?.label ?? null)
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
