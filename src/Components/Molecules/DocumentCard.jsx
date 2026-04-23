import { DOCUMENT_TYPES } from "../../Services/DocumentService";

const getDocumentLabel = (typeValue) => {
  const found = DOCUMENT_TYPES.find((dt) => dt.value === typeValue);
  return found ? found.label : typeValue;
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("es-MX", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });
};

const isPdf = (doc) => {
  const url = doc?.fileUrl || doc?.url || "";
  const mime = doc?.mimeType || doc?.fileType || "";
  return url.toLowerCase().endsWith(".pdf") || mime.includes("pdf");
};

const PdfIcon = () => (
  <svg
    width="40"
    height="48"
    viewBox="0 0 40 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="40" height="48" rx="4" fill="#E5E7EB" />
    <path
      d="M8 6h16l8 8v28a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2z"
      fill="white"
    />
    <path d="M24 6l8 8h-8V6z" fill="#D1D5DB" />
    <rect x="8" y="22" width="24" height="6" rx="1" fill="#DD4344" />
    <text
      x="20"
      y="27"
      textAnchor="middle"
      fill="white"
      fontSize="5"
      fontWeight="bold"
      fontFamily="sans-serif"
    >
      PDF
    </text>
  </svg>
);

const DocIcon = () => (
  <svg
    width="40"
    height="48"
    viewBox="0 0 40 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="40" height="48" rx="4" fill="#E5E7EB" />
    <path
      d="M8 6h16l8 8v28a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2z"
      fill="white"
    />
    <path d="M24 6l8 8h-8V6z" fill="#D1D5DB" />
    <rect x="10" y="22" width="20" height="2" rx="1" fill="#60A5FA" />
    <rect x="10" y="27" width="16" height="2" rx="1" fill="#93C5FD" />
    <rect x="10" y="32" width="12" height="2" rx="1" fill="#BFDBFE" />
  </svg>
);

const DocumentCard = ({ doc, onEdit, onDelete, deleting }) => {
  const label = getDocumentLabel(doc.type || doc.documentType);
  const date = formatDate(doc.createdAt || doc.date || doc.uploadedAt);
  const fileUrl = doc.fileUrl || doc.url || null;
  const isBeingDeleted = deleting === doc.id;

  const handlePreview = () => {
    if (fileUrl) window.open(fileUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col w-[200px] shadow-sm hover:shadow-md transition-shadow">
      {/* Thumbnail */}
      <button
        onClick={handlePreview}
        disabled={!fileUrl}
        title={fileUrl ? "Ver documento" : "Sin previsualización"}
        className={`
          w-full h-[120px] bg-slate-100 flex items-center justify-center transition-colors
          ${fileUrl ? "cursor-pointer hover:bg-slate-200" : "cursor-default"}
        `}
      >
        {isPdf(doc) ? <PdfIcon /> : <DocIcon />}
      </button>

      {/* Info + actions */}
      <div className="flex flex-col px-3 pt-2 pb-3 gap-1 flex-1">
        <p className="text-sm font-semibold text-slate-800 leading-tight line-clamp-2">
          {label}
        </p>
        <p className="text-xs text-slate-400">{date}</p>

        <div className="flex gap-2 mt-2 justify-end">
          {/* Edit */}
          <button
            onClick={() => onEdit(doc)}
            title="Editar"
            className="w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 flex items-center justify-center transition-colors"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>

          {/* Delete */}
          <button
            onClick={() => onDelete(doc)}
            disabled={isBeingDeleted}
            title="Eliminar"
            className="w-8 h-8 rounded-lg bg-[#dd4344] hover:bg-red-700 active:bg-red-800 flex items-center justify-center transition-colors disabled:opacity-60"
          >
            {isBeingDeleted ? (
              <svg
                className="animate-spin"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
              >
                <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
                <path d="M12 2a10 10 0 010 20" />
              </svg>
            ) : (
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentCard;
