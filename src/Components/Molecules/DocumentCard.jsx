import Button from "../Atoms/Button";

const PdfIcon = () => (
  <svg width="40" height="48" viewBox="0 0 40 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="48" rx="4" fill="#E5E7EB" />
    <path d="M8 6h16l8 8v28a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2z" fill="white" />
    <path d="M24 6l8 8h-8V6z" fill="#D1D5DB" />
    <rect x="8" y="22" width="24" height="6" rx="1" fill="#DD4344" />
    <text x="20" y="27" textAnchor="middle" fill="white" fontSize="5" fontWeight="bold" fontFamily="sans-serif">PDF</text>
  </svg>
);

const DocIcon = () => (
  <svg width="40" height="48" viewBox="0 0 40 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="48" rx="4" fill="#E5E7EB" />
    <path d="M8 6h16l8 8v28a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2z" fill="white" />
    <path d="M24 6l8 8h-8V6z" fill="#D1D5DB" />
    <rect x="10" y="22" width="20" height="2" rx="1" fill="#60A5FA" />
    <rect x="10" y="27" width="16" height="2" rx="1" fill="#93C5FD" />
    <rect x="10" y="32" width="12" height="2" rx="1" fill="#BFDBFE" />
  </svg>
);

const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const DeleteIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
  </svg>
);

const SpinnerIcon = () => (
  <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
    <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
    <path d="M12 2a10 10 0 010 20" />
  </svg>
);

const DocumentCard = ({ doc, label, date, fileUrl, isPdf, onEdit, onDelete, isBeingDeleted, canModify }) => {
  const handlePreview = () => {
    if (fileUrl) window.open(fileUrl, "_blank", "noopener,noreferrer");
  };

  return (
  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col w-full h-full shadow-sm hover:shadow-md transition-shadow">
      <Button
        onClick={handlePreview}
        disabled={!fileUrl}
        title={fileUrl ? "Ver documento" : "Sin previsualización"}
        bgColor="bg-slate-100"
        hoverColor={fileUrl ? "hover:bg-slate-200" : ""}
        activeColor=""
        width="w-full"
        height="h-[140px]"
        className="!rounded-none"
      >
        {isPdf ? <PdfIcon /> : <DocIcon />}
      </Button>

      <div className="flex flex-col px-4 pt-3 pb-4 gap-1 flex-1">
        <p className="text-sm font-semibold text-slate-800 leading-tight line-clamp-2">{label}</p>
        <p className="text-xs text-slate-400 mt-1">{date}</p>

        {canModify && (
          <div className="flex gap-2 mt-auto pt-3 justify-end">
            <Button
              onClick={() => onEdit(doc)}
              title="Editar"
              bgColor="bg-blue-600"
              hoverColor="hover:bg-blue-700"
              activeColor="active:bg-blue-800"
              width="w-8"
              height="h-8"
              className="!rounded-lg"
            >
              <EditIcon />
            </Button>

            <Button
              onClick={() => onDelete(doc)}
              disabled={isBeingDeleted}
              title="Eliminar"
              bgColor="bg-[#dd4344]"
              hoverColor="hover:bg-red-700"
              activeColor="active:bg-red-800"
              width="w-8"
              height="h-8"
              className="!rounded-lg"
            >
              {isBeingDeleted ? <SpinnerIcon /> : <DeleteIcon />}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentCard;