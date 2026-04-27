// src/Components/Organism/DocumentsSection.jsx
import Alert from "../Atoms/Alerts";
import Button from "../Atoms/Button";
import DocumentCard from "../Molecules/DocumentCard";
import DocumentUploadModal from "../Molecules/DocumentsUploads";
import ConfirmDeleteModal from "../Molecules/ConfirmDeleteModal";
import { DOCUMENT_TYPES } from "../../Services/DocumentService";

const getDocumentLabel = (typeValue) => {
  const found = DOCUMENT_TYPES.find((dt) => dt.value === typeValue);
  return found ? found.label : typeValue;
};

const formatDocumentDate = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });
};

const getDocumentFileUrl = (doc) => doc.fileUrl || doc.url || null;

const isDocumentPdf = (doc) => {
  const url = doc?.fileUrl || doc?.url || "";
  const mime = doc?.mimeType || doc?.fileType || "";
  return url.toLowerCase().endsWith(".pdf") || mime.includes("pdf");
};

const DocumentsSection = ({
  // datos
  documents,
  loadingDocs,
  fetchError,
  successMessage,
  canModify,
  deletingId,
  docToDelete,
  conflictDocument,
  // modal de subida
  showUploadModal,
  isEditing,
  documentType,
  fileName,
  displayError,
  modalError,
  modalLoading,
  // handlers
  handleOpenUpload,
  handleCloseModal,
  handleFileChange,
  handleSubmit,
  handleOpenEdit,
  setDocToDelete,
  handleDeleteConfirm,
  handleConflictConfirm,
  handleConflictCancel,
}) => {
  return (
    <div className="p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Documentos</h1>
        {canModify && (
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
        )}
      </div>

      {successMessage && <Alert type="success" message={successMessage} />}
      {fetchError && <Alert type="error" message={fetchError} />}

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
              key={doc.type}
              doc={doc}
              label={getDocumentLabel(doc.type || doc.documentType)}
              date={formatDocumentDate(
                doc.createdAt || doc.date || doc.uploadedAt,
              )}
              fileUrl={getDocumentFileUrl(doc)}
              isPdf={isDocumentPdf(doc)}
              onEdit={handleOpenEdit}
              onDelete={setDocToDelete}
              isBeingDeleted={deletingId === doc.type}
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
        documentOptions={DOCUMENT_TYPES}
        fileName={fileName}
        handleFileChange={handleFileChange}
        handleSubmit={handleSubmit}
        displayError={displayError || modalError}
        loading={modalLoading}
      />

      <ConfirmDeleteModal
        label={
          docToDelete
            ? getDocumentLabel(docToDelete.type || docToDelete.documentType)
            : null
        }
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDocToDelete(null)}
        loading={!!deletingId}
      />

      <ConfirmDeleteModal
        label={
          conflictDocument
            ? `"${getDocumentLabel(conflictDocument.field)}" ya existe. ¿Deseas reemplazarlo?`
            : null
        }
        onConfirm={handleConflictConfirm}
        onCancel={handleConflictCancel}
        loading={modalLoading}
      />
    </div>
  );
};

export default DocumentsSection;
