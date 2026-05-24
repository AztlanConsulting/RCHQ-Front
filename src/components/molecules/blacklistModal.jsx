import { useState } from "react";
import Modal from "../atoms/modal";
import { INVALID_REASON_CHARS_REGEX } from "../../utils/schema/blacklist/create.schema";

const MAX_CHARS = 250;

const BlacklistModal = ({ isOpen, employeeName, onConfirm, onCancel, isSubmitting }) => {
  const [reason, setReason] = useState("");
  const [fieldError, setFieldError] = useState(null);

  const handleReasonChange = (e) => {
    const sanitized = e.target.value.replace(INVALID_REASON_CHARS_REGEX, "");
    setReason(sanitized);
    if (fieldError) setFieldError(null);
  };

  const handleConfirm = () => {
    if (!reason.trim()) {
      setFieldError("La razón es obligatoria");
      return;
    }
    onConfirm(reason.trim());
  };

  const handleCancel = () => {
    setReason("");
    setFieldError(null);
    onCancel();
  };

  return (
    <Modal
      open={isOpen}
      onClose={isSubmitting ? undefined : handleCancel}
      grayBackground={true}
      placement="center"
      className="max-w-lg"
    >
      <div className="flex flex-col gap-6">
        <p className="text-center text-xl font-semibold text-gray-900 leading-snug">
          Estás a punto de AGREGAR a la lista negra a &quot;{employeeName}&quot;
        </p>

        <div className="flex flex-col gap-1">
          <label htmlFor="blacklist-reason" className="text-sm font-medium text-gray-700">
            Razón
          </label>

          <div
            className={`flex w-full cursor-text rounded-lg bg-neutral-50 px-4 py-2 shadow-[inset_0px_4px_4px_#00000040] ${
              fieldError ? "ring-1 ring-[#9b1c1c]/50" : ""
            }`}
            onClick={() => document.getElementById("blacklist-reason")?.focus()}
          >
            <textarea
              id="blacklist-reason"
              rows={5}
              value={reason}
              onChange={handleReasonChange}
              disabled={isSubmitting}
              maxLength={MAX_CHARS}
              placeholder="Escribe la razón para agregar a la lista negra..."
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

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="flex-1 rounded-lg bg-[#9b1c1c] py-2.5 text-sm font-semibold text-white hover:bg-[#7a1616] active:bg-[#5c1010] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Procesando..." : "Aceptar"}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default BlacklistModal;