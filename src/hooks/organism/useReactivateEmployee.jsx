import { useState } from "react";
// import { reactivateEmployeeSchema } from "@/utils/schema/employee/reactivate.schema";
import {
  reactivateEmployeeService,
} from "@/services/reactivateEmployeeService";

export const useReactivateEmployee = (employeeId, employeeName, setAlert, isActive = true, onSuccess) => {
  const [isReactivateModalOpen, setIsReactivateModalOpen] = useState(false);
//   const [reason, setReason] = useState("");
//   const [addToBlacklist, setAddToBlacklist] = useState(false);
//   const [fieldError, setFieldError] = useState(null);
  const [isSubmittingReactivate, setIsSubmittingReactivate] = useState(false);

  const openReactivateModal = () => {
    if (isActive) {
      setAlert({
        type: "error",
        message: "El empleado ya ha sido reactivado previamente.",
      });
      return;
    }
    // setReason("");
    // setAddToBlacklist(false);
    // setFieldError(null);
    setIsReactivateModalOpen(true);
  };

  const closeReactivateModal = () => {
    if (isSubmittingReactivate) return;
    setIsReactivateModalOpen(false);
  };

//   const handleReasonChange = (value) => {
//     if (value.length > 250) return;
//     setReason(value);
//     const parsed = deactivateEmployeeSchema.pick({ reason: true }).safeParse({ reason: value });
//     if (!parsed.success) {
//       setFieldError(parsed.error.issues[0].message);
//     } else if (isActive && !value.trim()) {
//       setFieldError('El campo "Razón" es obligatorio.');
//     } else {
//       setFieldError(null);
//     }
//   };

  const handleSubmitReactivate = async () => {
    // const parsed = deactivateEmployeeSchema.safeParse({ reason, addToBlacklist });
    // if (!parsed.success) {
    //   setFieldError(parsed.error.issues[0].message);
    //   return;
    // }

    // if (isActive && !reason.trim()) {
    //   setFieldError('El campo "Razón" es obligatorio.');
    //   return;
    // }

    setIsSubmittingReactivate(true);
    // setFieldError(null);

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
    // reason,
    // handleReasonChange,
    // addToBlacklist,
    // setAddToBlacklist,
    // fieldError,
    isSubmittingReactivate,
    handleSubmitReactivate,
  };
};