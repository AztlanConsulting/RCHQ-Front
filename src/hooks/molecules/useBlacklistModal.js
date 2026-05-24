import { useState, useCallback, useEffect } from "react";

const useBlacklistModal = ({ onConfirm, onCancel, invalidCharsRegex, isOpen }) => {
  const [reason, setReason] = useState("");
  const [fieldError, setFieldError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setReason("");
      setFieldError(null);
    }
  }, [isOpen]);

  const handleReasonChange = useCallback((e) => {
    const value = e.target.value;
    const sanitized = invalidCharsRegex ? value.replace(invalidCharsRegex, "") : value;
    setReason(sanitized);
    if (fieldError) setFieldError(null);
  }, [invalidCharsRegex, fieldError]);

  const handleConfirm = useCallback(() => {
    if (!reason.trim()) {
      setFieldError("La razón es obligatoria");
      return;
    }
    onConfirm(reason.trim());
  }, [reason, onConfirm]);

  const handleCancel = useCallback(() => {
    setReason("");
    setFieldError(null);
    if (onCancel) onCancel();
  }, [onCancel]);

  return { reason, fieldError, handleReasonChange, handleConfirm, handleCancel };
};

export default useBlacklistModal;