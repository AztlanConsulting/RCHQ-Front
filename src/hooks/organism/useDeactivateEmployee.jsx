import { useState } from "react";
import { deactivateEmployeeSchema } from "@/utils/schema/employee/deactivate.schema";
import {
  deactivateEmployeeService,
  insertIntoBlacklistService,
} from "@/services/deactivateEmployeeService";

export const useDeactivateEmployee = (employeeId, employeeName, curp, setAlert) => {
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
    setReason(value);
    if (fieldError) setFieldError(null);
  };

  const handleSubmit = async () => {
    const parsed = deactivateEmployeeSchema.safeParse({ reason });
    if (!parsed.success) {
      setFieldError(parsed.error.issues[0].message);
      return;
    }

    setIsSubmitting(true);
    setFieldError(null);

    try {
      await deactivateEmployeeService(employeeId, reason);
    } catch (err) {
      setAlert({
        type: "error",
        message: err?.message ?? `Hubo un error al dar de baja a "${employeeName}".`,
      });
      setIsModalOpen(false);
      setIsSubmitting(false);
      return;
    }

    if (!addToBlacklist) {
      setAlert({
        type: "success",
        message: `"${employeeName}" ha sido dado de baja.`,
      });
      setIsModalOpen(false);
      setIsSubmitting(false);
      return;
    }

    try {
      await insertIntoBlacklistService(curp);
      setAlert({
        type: "success",
        message: `"${employeeName}" ha sido dado de baja y agregado a la lista negra.`,
      });
    } catch (err) {
      setAlert({
        type: "error",
        message: err?.message ?? `"${employeeName}" ha sido dado de baja, pero hubo un error al agregarlo a la lista negra.`,
      });
    }

    setIsModalOpen(false);
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