import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getFirstLoginToken,
  setPreTwoFactorAuthToken,
} from "../../utils/authStorage";
import { changePasswordFirstLoginService } from "../../Services/PasswordService";
import useAuth from "../useAuth";
import {
  firstLoginChangePasswordSchema,
  getFirstSchemaError,
} from "../../utils/Schema/Auth/password.schemas";
import { mapPasswordApiError } from "../../utils/password/passwordErrorMapper";

export const useChangePassword = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const token = getFirstLoginToken();
    if (!token) {
      navigate("/iniciar-sesion", { replace: true });
    }
  }, [navigate]);

  const toggleNewPassword = () => setShowNewPassword((value) => !value);
  const toggleConfirmPassword = () => setShowConfirmPassword((value) => !value);

  const handleSubmit = async ({ newPassword, confirmPassword }) => {
    setLoading(true);
    setErrors([]);

    const validation = firstLoginChangePasswordSchema.safeParse({
      newPassword,
      confirmPassword,
    });

    if (!validation.success) {
      setErrors([
        getFirstSchemaError(validation) || "Revisa los campos del formulario",
      ]);
      setLoading(false);
      return;
    }

    try {
      const response = await changePasswordFirstLoginService(
        newPassword,
        confirmPassword,
      );

      if (response?.nextStep === "VERIFY_TwoFactorAuth") {
        const preTwoFactorAuthToken = response?.data?.preTwoFactorAuthToken;

        if (!preTwoFactorAuthToken) {
          setErrors(["No se recibió un token válido para continuar con 2FA"]);
          return;
        }

        setPreTwoFactorAuthToken(preTwoFactorAuthToken);
        navigate("/2FA", { replace: true });
        return;
      }

      const token = response?.data?.token;
      const user = response?.data?.user;

      if (!token) {
        setErrors(["No se recibió un token de sesión válido"]);
        return;
      }

      login({ token, user });
      navigate("/app/dashboard", { replace: true });
    } catch (err) {
      console.error(err);
      setErrors(mapPasswordApiError(err, "first-login"));
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    errors,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    showNewPassword,
    toggleNewPassword,
    showConfirmPassword,
    toggleConfirmPassword,
    handleSubmit,
  };
};
