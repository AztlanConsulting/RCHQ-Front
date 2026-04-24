import { useState, useEffect } from "react";
import { useField } from "../Atoms/useField";
import { useToggle } from "../Atoms/useToggle";
import {
  getStatusTwoFactorAuth,
  desactivateTwoFactorAuthService,
} from "../../Services/AuthService";

export const useTwoFactorAuthOptions = () => {
  const showTwoFactorAuthModal = useToggle();
  const showDisableModal = useToggle();
  const showPassword = useToggle();
  const password = useField();

  const [isTwoFactorAuthActive, setIsTwoFactorAuthActive] = useState(false);
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
        const response = await getStatusTwoFactorAuth();
        setIsTwoFactorAuthActive(response.Status2FA ?? false);
      } catch (err) {
        console.error("Error al obtener estado del 2FA:", err);
      }
    };
    fetchStatus();
  }, []);

  const handleEnableSuccess = () => {
    showTwoFactorAuthModal.toggle(false);
    setIsTwoFactorAuthActive(true);
    setSuccessMessage(
      "La autenticación en dos pasos ha sido activada correctamente.",
    );
  };
  const handleDisable = async () => {
    if (!password.value) {
      setError("Ingresa tu contraseña para continuar");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await desactivateTwoFactorAuthService(password.value);
      if (response.nextStep === "2FA_DISABLED") {
        setIsTwoFactorAuthActive(false);
        showDisableModal.toggle(false);
        password.handleValue("");
        setSuccessMessage(
          "La autenticación en dos pasos ha sido desactivada correctamente.",
        );
      }
    } catch (err) {
      setError(
        err.message || "Error al desactivar la autenticación en dos pasos",
      );
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
    showTwoFactorAuthModal,
    showDisableModal,
    showPassword,
    password,
    isTwoFactorAuthActive,
    setIsTwoFactorAuthActive,
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
