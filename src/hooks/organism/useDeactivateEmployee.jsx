import { useState } from "react";
import { deactivateEmployeeSchema } from "@/utils/schema/employee/deactivate.schema";
import {
  deactivateEmployeeService,
} from "@/services/deactivateEmployeeService";

export const useDeactivateEmployee = (employeeId, employeeName, setAlert, isActive = true, onSuccess) => {
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [addToBlacklist, setAddToBlacklist] = useState(false);
  const [fieldError, setFieldError] = useState(null);
  const [isSubmittingDeactivate, setIsSubmittingDeactivate] = useState(false);

  const openDeactivateModal = () => {
    if (!isActive) {
      setAlert({
        type: "error",
        message: "El empleado ya ha sido dado de baja previamente.",
      });
      return;
    }
    setReason("");
    setAddToBlacklist(false);
    setFieldError(null);
    setIsDeactivateModalOpen(true);
  };

  const closeDeactivateModal = () => {
    if (isSubmittingDeactivate) return;
    setIsDeactivateModalOpen(false);
  };

  const handleReasonChange = (value) => {
    if (value.length > 250) return;
    setReason(value);
    const parsed = deactivateEmployeeSchema.pick({ reason: true }).safeParse({ reason: value });
    if (!parsed.success) {
      setFieldError(parsed.error.issues[0].message);
    } else if (isActive && !value.trim()) {
      setFieldError('El campo "Razón" es obligatorio.');
    } else {
      setFieldError(null);
    }
  };

  const handleSubmitDeactivate = async () => {
    const parsed = deactivateEmployeeSchema.safeParse({ reason, addToBlacklist });
    if (!parsed.success) {
      setFieldError(parsed.error.issues[0].message);
      return;
    }

    if (isActive && !reason.trim()) {
      setFieldError('El campo "Razón" es obligatorio.');
      return;
    }

    setIsSubmittingDeactivate(true);
    setFieldError(null);

    try {
      await deactivateEmployeeService(employeeId, reason, addToBlacklist);
      setIsDeactivateModalOpen(false);
      setAlert({
        type: "success",
        message: `"${employeeName}" ha sido dado de baja${addToBlacklist ? " y agregado a la lista negra." : "."}`,
      });
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setIsDeactivateModalOpen(false);
      setAlert({
        type: "error",
        message: err?.message ?? `Hubo un error al dar de baja a "${employeeName}".`,
      });
    }
    setIsSubmittingDeactivate(false);
  };

  return {
    isDeactivateModalOpen,
    openDeactivateModal,
    closeDeactivateModal,
    reason,
    handleReasonChange,
    addToBlacklist,
    setAddToBlacklist,
    fieldError,
    isSubmittingDeactivate,
    handleSubmitDeactivate,
  };
};