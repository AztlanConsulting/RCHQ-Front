import { DOCUMENT_TYPES } from "../../Services/DocumentService";

const getDocumentLabel = (typeValue) => {
  const found = DOCUMENT_TYPES.find((dt) => dt.value === typeValue);
  return found ? found.label : typeValue;
};

const ConfirmDeleteModal = ({ doc, onConfirm, onCancel, loading }) => {
  if (!doc) return null;

  const label = getDocumentLabel(doc.type || doc.documentType);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-xl flex flex-col gap-4">
        <h3 className="text-lg font-semibold text-slate-900">
          Eliminar documento
        </h3>

        <p className="text-sm text-slate-500">
          ¿Estás seguro de que deseas eliminar{" "}
          <span className="font-semibold text-slate-700">{label}</span>? Esta
          acción no se puede deshacer.
        </p>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 text-sm font-semibold bg-[#dd4344] text-white rounded-lg hover:bg-red-700 disabled:opacity-60 transition-colors"
          >
            {loading ? "Eliminando..." : "Eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
