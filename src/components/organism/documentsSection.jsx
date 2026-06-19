import { useMemo } from "react";
import { useLocation, useNavigate, matchPath } from "react-router-dom";
import Alert from "../atoms/alerts";
import BigButton from "../atoms/bigButton";
import DocumentCard from "../molecules/documentCard";
import DocumentUploadModal from "../molecules/documentsUploads";
import ConfirmDeleteModal from "../molecules/confirmDeleteModal";
import {
  getAllDisplayCategories,
  groupDocumentsByCategory,
} from "../../utils/documentGrouping";
import { UNCATEGORIZED_CATEGORY_ID } from "../../utils/documentCategories";

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
  groupedDocumentOptions,
  flatDocumentOptions,
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

  const groupedDocuments = useMemo(
    () => groupDocumentsByCategory(documents),
    [documents],
  );

  const displayCategories = useMemo(
    () =>
      getAllDisplayCategories().filter(
        (category) =>
          category.id !== UNCATEGORIZED_CATEGORY_ID ||
          (groupedDocuments[category.id]?.length ?? 0) > 0,
      ),
    [groupedDocuments],
  );

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
            text="Subir documento"
            onClick={handleOpenUpload}
            className="h-[42px] min-w-0 sm:px-5 text-sm"
            mobileIcon="/add.svg"
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
      ) : (
        <div className="flex flex-col gap-10">
          {displayCategories.map((category) => {
            const docsInCategory = groupedDocuments[category.id] ?? [];

            return (
              <section key={category.id} className="flex flex-col gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {category.title}
                  </h2>
                  <p className="text-sm text-slate-500">{category.description}</p>
                </div>

                {docsInCategory.length === 0 ? (
                  <p className="text-slate-400 text-sm">Sin documentos</p>
                ) : (
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-6">
                    {docsInCategory.map((doc) => (
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
              </section>
            );
          })}
        </div>
      )}

      <DocumentUploadModal
        isOpen={showUploadModal}
        onClose={handleCloseModal}
        isEditing={isEditing}
        documentTypeValue={documentType.value}
        setDocumentType={documentType.handleValue}
        groupedDocumentOptions={groupedDocumentOptions}
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
            ? (flatDocumentOptions.find(
                (d) => d.value === conflictDocument.field,
              )?.label ?? null)
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
