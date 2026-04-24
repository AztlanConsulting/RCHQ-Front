import { useState, useEffect } from "react";
import { useField } from "../Atoms/useField";
import { useToggle } from "../Atoms/useToggle";
import {
  getStatus2FA,
  desactivate2FAService,
} from "../../Services/AuthService";

export const useTwoFactorAuthOptions = () => {
  const show2FAModal = useToggle(false);
  const showDisableModal = useToggle(false);
  const showPassword = useToggle(false);
  const password = useField();

  const [is2FAActive, setIs2FAActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(() => setSuccessMessage(""), 4000);
    return () => clearTimeout(timer);
  }, [successMessage]);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await getStatus2FA();
        setIs2FAActive(response.Status2FA ?? false);
      } catch (err) {
        console.error("Error al obtener estado del 2FA:", err);
      }
    };
    fetchStatus();
  }, []);

  const handleEnableSuccess = () =>{
    show2FAModal.toggle(false);
    setIs2FAActive(true);
    setSuccessMessage("La autenticación en dos pasos ha sido activada correctamente.");
  }
  const handleDisable = async () => {
    if (!password.value) { 
      setError("Ingresa tu contraseña para continuar");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await desactivate2FAService(password.value); 
      if (response.nextStep === "2FA_DISABLED") {
        setIs2FAActive(false);
        showDisableModal.toggle(false); 
        password.handleValue("");
        setSuccessMessage("La autenticación en dos pasos ha sido desactivada correctamente.");
      }
    } catch (err) {
      setError(err.message || "Error al desactivar la autenticación en dos pasos");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelDisable = () => {
    showDisableModal.toggle(false); 
    password.handleValue("");
    setError("");
  };

  return {
    show2FAModal,     
    showDisableModal, 
    showPassword,     
    password,         
    is2FAActive,
    setIs2FAActive,
    loading,
    error,
    setError,
    successMessage,
    setSuccessMessage,
    handleDisable,
    handleEnableSuccess,
    handleCancelDisable,
  };
};