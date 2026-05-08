import Alert from "../Atoms/Alerts";

// ─── LeaveCard ────────────────────────────────────────────────────────────────
const LeaveCard = ({ employeeName, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
        <p className="text-xl font-bold mb-2">
          ¿Estás seguro de que quieres dar de baja a la siguiente persona?
        </p>
        <p className="text-lg font-semibold mb-8">"{employeeName}"</p>

        <div className="flex gap-4 justify-center">
          <button
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
          >
            Dar de baja
          </button>
          <button
            onClick={onCancel}
            className="bg-[#1a2e5a] hover:bg-[#162549] text-white font-semibold px-6 py-2 rounded-lg transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── ReasonCard ───────────────────────────────────────────────────────────────
const ReasonCard = ({
  employeeName,
  reason,
  setReason,
  intoBlacklist,
  setIntoBlacklist,
  onConfirm,
  onCancel,
  isLoading,
}) => {
  const MAX_CHARS = 250;
  const isOverLimit = reason.length > MAX_CHARS;
  const isEmpty = reason.trim().length === 0;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <p className="text-xl font-bold mb-6 text-center">
          Estás a punto de dar de baja a "{employeeName}"
        </p>

        <label className="block text-sm font-medium text-gray-700 mb-1">
          Razón
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={4}
          maxLength={MAX_CHARS + 1}
          className={`w-full border rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 ${
            isOverLimit
              ? "border-red-500 focus:ring-red-400"
              : "border-gray-300 focus:ring-blue-400"
          }`}
        />

        {isOverLimit && (
          <p className="text-red-500 text-xs mt-1">
            El campo "Razón" es de máximo 250 caracteres
          </p>
        )}

        <div className="flex items-center gap-2 mt-4">
          <input
            type="checkbox"
            id="intoBlacklist"
            checked={intoBlacklist}
            onChange={(e) => setIntoBlacklist(e.target.checked)}
            className="w-4 h-4 accent-[#1a2e5a]"
          />
          <label htmlFor="intoBlacklist" className="text-sm text-gray-700">
            Agregar a la lista negra.
          </label>
        </div>

        <div className="flex gap-4 justify-center mt-6">
          <button
            onClick={onConfirm}
            disabled={isLoading || isEmpty || isOverLimit}
            className="bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-6 py-2 rounded-lg transition-colors"
          >
            {isLoading ? "Procesando..." : "Dar de baja"}
          </button>
          <button
            onClick={onCancel}
            className="bg-[#1a2e5a] hover:bg-[#162549] text-white font-semibold px-6 py-2 rounded-lg transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Export ───────────────────────────────────────────────────────────────────
export { LeaveCard, ReasonCard };