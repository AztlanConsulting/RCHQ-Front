/**
 * reasonCard.jsx
 * Organism — Modal para dar de baja a un empleado.
 *
 * Recibe todo su estado desde useDeactivateEmployee (sin lógica propia).
 * Se monta dentro de detalleEmpleado.jsx.
 *
 * Props:
 *  - isOpen        {boolean}
 *  - employeeName  {string}
 *  - reason        {string}
 *  - onReasonChange {(value: string) => void}
 *  - addToBlacklist {boolean}
 *  - onBlacklistChange {(checked: boolean) => void}
 *  - fieldError    {string|null}
 *  - isSubmitting  {boolean}
 *  - onSubmit      {() => void}
 *  - onCancel      {() => void}
 */

const MAX_CHARS = 250;

const ReasonCard = ({
  isOpen,
  employeeName,
  reason,
  onReasonChange,
  addToBlacklist,
  onBlacklistChange,
  fieldError,
  isSubmitting,
  onSubmit,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-8 flex flex-col gap-6">
        <p className="text-center text-xl font-semibold text-gray-900 leading-snug">
          Estás a punto de dar de baja a &quot;{employeeName}&quot;
        </p>

        <div className="flex flex-col gap-1">
          <label htmlFor="deactivate-reason" className="text-sm font-medium text-gray-700">
            Razón
          </label>
          <textarea
            id="deactivate-reason"
            rows={5}
            value={reason}
            onChange={(e) => onReasonChange(e.target.value)}
            disabled={isSubmitting}
            maxLength={MAX_CHARS}
            placeholder="Escribe la razón de la baja..."
            className={`w-full resize-none rounded-lg border px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 disabled:opacity-60 ${
              fieldError
                ? "border-red-400 focus:ring-red-300"
                : "border-gray-300 focus:ring-blue-300"
            }`}
          />
          <div className="flex items-center justify-between">
            <span className={`text-xs ${fieldError ? "text-red-500 font-medium" : "text-transparent"}`}>
              {fieldError ?? "placeholder"}
            </span>
            <span className={`text-xs tabular-nums ${reason.length >= MAX_CHARS ? "text-red-500 font-semibold" : "text-gray-400"}`}>
              {reason.length}/{MAX_CHARS}
            </span>
          </div>
        </div>

        <label className="flex items-center gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={addToBlacklist}
            onChange={(e) => onBlacklistChange(e.target.checked)}
            disabled={isSubmitting}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-60"
          />
          <span className="text-sm text-gray-700">Agregar a la lista negra.</span>
        </label>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting}
            className="flex-1 rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700 active:bg-red-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Procesando..." : "Dar de baja"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 rounded-lg bg-[#1e3a5f] py-2.5 text-sm font-semibold text-white hover:bg-[#162d4a] active:bg-[#102040] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReasonCard;