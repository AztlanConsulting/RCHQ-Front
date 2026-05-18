import { REASON_REGEX } from "../../utils/schema/employee/deactivate.schema";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-8 flex flex-col gap-6">
        <p className="text-center text-xl font-semibold text-gray-900 leading-snug">
          Estás a punto de dar de baja a &quot;{employeeName}&quot;
        </p>

        <div className="flex flex-col gap-1">
          <label htmlFor="deactivate-reason" className="text-sm font-medium text-gray-700">
            Razón
          </label>

          <div
            className={`flex w-full cursor-text rounded-lg bg-neutral-50 px-4 py-2 shadow-[inset_0px_4px_4px_#00000040] ${
              fieldError ? "ring-1 ring-[#9b1c1c]/50" : ""
            }`}
            onClick={() => document.getElementById("deactivate-reason")?.focus()}
          >
            <textarea
              id="deactivate-reason"
              rows={5}
              value={reason}
            onChange={(e) => {
              if (REASON_REGEX.test(e.target.value)) {
                onReasonChange(e.target.value);
              }
            }}
              disabled={isSubmitting}
              maxLength={MAX_CHARS}
              placeholder="Escribe la razón de la baja..."
              className="w-full resize-none bg-transparent border-0 outline-none text-sm font-medium text-[#222] placeholder-[#aaaaaa]"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className={`text-xs ${fieldError ? "text-[#9b1c1c] font-medium" : "text-transparent"}`}>
              {fieldError ?? "placeholder"}
            </span>
            <span className={`text-xs tabular-nums ${reason.length >= MAX_CHARS ? "text-[#9b1c1c] font-semibold" : "text-gray-400"}`}>
              {reason.length}/{MAX_CHARS}
            </span>
          </div>
        </div>

        <div
          className="flex items-center gap-3 cursor-pointer select-none"
          onClick={() => !isSubmitting && onBlacklistChange(!addToBlacklist)}
          role="checkbox"
          aria-checked={addToBlacklist}
          tabIndex={0}
          onKeyDown={(e) => e.key === " " && !isSubmitting && onBlacklistChange(!addToBlacklist)}
        >
          <div
            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors ${
              addToBlacklist
                ? "bg-[#1e3a5f] border-[#1e3a5f]"
                : "bg-neutral-50 border-gray-300 shadow-[inset_0px_2px_3px_#00000030]"
            } ${isSubmitting ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
          >
            {addToBlacklist && (
              <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none">
                <path
                  d="M2 6l3 3 5-5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
          <span className={`text-sm text-gray-700 ${isSubmitting ? "opacity-60" : ""}`}>
            Agregar a la lista negra.
          </span>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting}
            className="flex-1 rounded-lg bg-[#9b1c1c] py-2.5 text-sm font-semibold text-white hover:bg-[#7a1616] active:bg-[#5c1010] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
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