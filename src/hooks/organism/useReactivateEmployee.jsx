import { useState } from "react";
import {
  reactivateEmployeeService,
} from "@/services/reactivateEmployeeService";

export const useReactivateEmployee = (employeeId, employeeName, setAlert, isActive = true, onSuccess) => {
  const [isReactivateModalOpen, setIsReactivateModalOpen] = useState(false);
  const [isSubmittingReactivate, setIsSubmittingReactivate] = useState(false);

  const openReactivateModal = () => {
    if (isActive) {
      setAlert({
        type: "error",
        message: "El empleado ya ha sido reactivado previamente.",
      });
      return;
    }
    setIsReactivateModalOpen(true);
  };

  const closeReactivateModal = () => {
    if (isSubmittingReactivate) return;
    setIsReactivateModalOpen(false);
  };

  const handleSubmitReactivate = async () => {
    setIsSubmittingReactivate(true);

    try {
      await reactivateEmployeeService(employeeId);
      setIsReactivateModalOpen(false);
      setAlert({
        type: "success",
        message: `"${employeeName}" ha sido reactivado`,
      });
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setIsReactivateModalOpen(false);
      setAlert({
        type: "error",
        message: err?.message ?? `Hubo un error al reactivar a "${employeeName}".`,
      });
    }
    setIsSubmittingReactivate(false);
  };

  return {
    isReactivateModalOpen,
    openReactivateModal,
    closeReactivateModal,
    isSubmittingReactivate,
    handleSubmitReactivate,
  };
};