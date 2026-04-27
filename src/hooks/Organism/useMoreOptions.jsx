import { useState, useEffect } from "react";
import { useField } from "../Atoms/useField";
import { useToggle } from "../Atoms/useToggle";
import {
  getTwoFactorAuthStatus,
  deactivateTwoFactorAuthService,
} from "../../Services/AuthService";
import { changePasswordService } from "../../Services/PasswordService";
import {
  selfServiceChangePasswordSchema,
  getFirstSchemaError,
} from "../../utils/Schema/Auth/password.schemas";
import { mapPasswordApiError } from "../../utils/password/passwordErrorMapper";

export const useTwoFactorAuthOptions = () => {
  const showTwoFactorAuthModal = useToggle();
  const showDisableModal = useToggle();
  const showPassword = useToggle();
  const password = useField();

  const [isTwoFactorAuthActive, setIsTwoFactorAuthActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);
  const [changePasswordErrors, setChangePasswordErrors] = useState([]);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const showCurrentPassword = useToggle();
  const showNewPassword = useToggle();
  const showConfirmPassword = useToggle();

  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(() => setSuccessMessage(""), 4000);
    return () => clearTimeout(timer);
  }, [successMessage]);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await getTwoFactorAuthStatus();
        setIsTwoFactorAuthActive(response.StatusTwoFactorAuth ?? false);
      } catch (err) {
        console.error(
          "Error al obtener estado de la autenticación en dos pasos:",
          err,
        );
      }
    };
    fetchStatus();
  }, []);

  const handleEnableSuccess = () => {
    showTwoFactorAuthModal.toggle();
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
      const response = await deactivateTwoFactorAuthService(password.value);
      if (response.nextStep === "TwoFactorAuth_DISABLED") {
        setIsTwoFactorAuthActive(false);
        showDisableModal.toggle();
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
    showDisableModal.toggle();
    password.handleValue("");
    setError("");
  };

  const handleCloseChangePasswordModal = () => {
    if (changePasswordLoading) return;
    setShowChangePasswordModal(false);
    setChangePasswordErrors([]);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    showCurrentPassword.setValue(false);
    showNewPassword.setValue(false);
    showConfirmPassword.setValue(false);
  };

  const handleSubmitChangePassword = async ({
    currentPassword,
    newPassword,
    confirmPassword,
  }) => {
    setChangePasswordLoading(true);
    setChangePasswordErrors([]);

    const validation = selfServiceChangePasswordSchema.safeParse({
      currentPassword,
      newPassword,
      confirmPassword,
    });

    if (!validation.success) {
      setChangePasswordErrors([
        getFirstSchemaError(validation) || "Revisa los campos del formulario",
      ]);
      setChangePasswordLoading(false);
      return;
    }

    try {
      const response = await changePasswordService(
        currentPassword,
        newPassword,
        confirmPassword,
      );

      if (!response?.success) {
        setChangePasswordErrors(["No se pudo cambiar la contraseña"]);
        return;
      }

      setSuccessMessage("La contraseña se actualizó correctamente.");
      handleCloseChangePasswordModal();
    } catch (err) {
      console.error(err);
      setChangePasswordErrors(mapPasswordApiError(err, "self-service"));
    } finally {
      setChangePasswordLoading(false);
    }
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
    showChangePasswordModal,
    setShowChangePasswordModal,
    changePasswordLoading,
    changePasswordErrors,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    showCurrentPassword,
    showNewPassword,
    showConfirmPassword,
    handleCloseChangePasswordModal,
    handleSubmitChangePassword,
  };
};
