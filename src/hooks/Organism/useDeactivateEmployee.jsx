import { useState } from "react";
import { deactivateEmployeeService } from "../../Services/EmployeeService";
import { getReadableErrors } from "../../utils/apiErrors";

const useDeactivateEmployee = (employeeId, employeeName, onSuccess) => {
  // Controla qué card está visible: null | "leave" | "reason"
  const [activeCard, setActiveCard] = useState(null);
  const [reason, setReason] = useState("");
  const [intoBlacklist, setIntoBlacklist] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState(null); // { type, message }

  const openLeaveCard = () => {
    setActiveCard("leave");
  };

  const closeAll = () => {
    setActiveCard(null);
    setReason("");
    setIntoBlacklist(false);
  };

  const goToReasonCard = () => {
    setActiveCard("reason");
  };

  const handleDeactivate = async () => {
    if (!reason.trim()) {
      setAlert({ type: "error", message: 'El campo "Razón" no debe estar vacío' });
      return;
    }

    setIsLoading(true);
    closeAll();

    try {
      await deactivateEmployeeService(employeeId, reason, intoBlacklist);

      const message = intoBlacklist
        ? `"${employeeName}" ha sido dado de baja y agregado a la lista negra.`
        : `"${employeeName}" ha sido dado de baja.`;

      setAlert({ type: "success", message });
      onSuccess?.();
    } catch (err) {
      const [message] = getReadableErrors(err);
      setAlert({ type: "error", message });
    } finally {
      setIsLoading(false);
    }
  };

  const clearAlert = () => setAlert(null);

  return {
    activeCard,
    reason,
    setReason,
    intoBlacklist,
    setIntoBlacklist,
    isLoading,
    alert,
    clearAlert,
    openLeaveCard,
    closeAll,
    goToReasonCard,
    handleDeactivate,
  };
};

export default useDeactivateEmployee;