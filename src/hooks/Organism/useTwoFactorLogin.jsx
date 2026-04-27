import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  validateLoginTwoFactorAuthService,
  getPreTwoFactorAuthToken,
  getToken,
} from "../../Services/AuthService";
import { useAuthContext } from "../../context/AuthContext";
import { useField } from "../Atoms/useField";
import { useToggle } from "../Atoms/useToggle";

export const useTwoFactorLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuthContext();
  const codeField = useField(6);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { value: isBlocked, toggle: blockToggle } = useToggle(false);

  useEffect(() => {
    const preTwoFactorAuthToken = getPreTwoFactorAuthToken();
    const sessionToken = getToken();

    if (sessionToken) {
      navigate("/app/dashboard", { replace: true });
      return;
    }
    if (!preTwoFactorAuthToken) {
      navigate("/iniciar-sesion", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async () => {
    if (isBlocked) return;

    if (codeField.value.length !== 6) {
      setError("El código debe tener 6 dígitos");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await validateLoginTwoFactorAuthService(codeField.value);

      if (response.nextStep === "LOGIN_COMPLETE") {
        localStorage.removeItem("PRE_TwoFactorAuth");
        login({ token: response.token, user: response.data });
        navigate("/app/dashboard", { replace: true });
      }
    } catch (err) {
      console.error(err);
      if (err.status === 423) {
        setError(
          "La autenticación en dos pasos está bloqueada temporalmente. Intenta más tarde.",
        );
        blockToggle(); // → true, se bloquea una sola vez
      } else {
        setError(
          err.message || "Código de autenticación en dos pasos inválido",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    code: codeField.value,
    setCode: codeField.handleValue,
    error,
    loading,
    isBlocked,
    handleSubmit,
  };
};
