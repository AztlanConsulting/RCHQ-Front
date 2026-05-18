import { useState } from "react";
import { deactivateEmployeeSchema } from "@/utils/schema/employee/deactivate.schema";
import {
  deactivateEmployeeService,
} from "@/services/deactivateEmployeeService";

export const useDeactivateEmployee = (employeeId, employeeName, setAlert) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [addToBlacklist, setAddToBlacklist] = useState(false);
  const [fieldError, setFieldError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openModal = () => {
    setReason("");
    setAddToBlacklist(false);
    setFieldError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (isSubmitting) return;
    setIsModalOpen(false);
  };

  const handleReasonChange = (value) => {
    if (value.length > 250) return;
    if (/[<>]/.test(value)) return;
    setReason(value);
    if (fieldError) setFieldError(null);
  };

  const handleSubmit = async () => {
    const parsed = deactivateEmployeeSchema.safeParse({ reason, addToBlacklist });
    if (!parsed.success) {
      setFieldError(parsed.error.issues[0].message);
      return;
    }

    setIsSubmitting(true);
    setFieldError(null);

    try {
      await deactivateEmployeeService(employeeId, reason, addToBlacklist);
      setIsModalOpen(false);
      setAlert({
        type: "success",
        message: `"${employeeName}" ha sido dado de baja${addToBlacklist ? " y agregado a la lista negra." : "."}`,
      });
    } catch (err) {
      setIsModalOpen(false);
      setAlert({
        type: "error",
        message: err?.message ?? `Hubo un error al dar de baja a "${employeeName}".`,
      });
    }
    setIsSubmitting(false);
  };

  return {
    isModalOpen,
    openModal,
    closeModal,
    reason,
    handleReasonChange,
    addToBlacklist,
    setAddToBlacklist,
    fieldError,
    isSubmitting,
    handleSubmit,
  };
};