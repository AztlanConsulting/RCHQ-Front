import { useState } from "react";
import { verify2FAService } from "../../Services/AuthService";

export const use2FAVerification = (onSuccess) => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const verifyCode = async () => {
    if (code.length !== 6) {
      setError("El código debe tener 6 dígitos.");
      return;
    }

    if (isNaN(Number(code))) {
      setError("El código debe ser número");
    }

    setLoading(true);
    setError("");

    try {
      const response = await verify2FAService(code);
      console.log("respuesta", response);
      if (!response) {
        throw new Error("No se pudo validar el código");
      }
      if (response.nextStep === "2FA_SETUP_COMPLETE") {
        onSuccess();
      } else {
        throw new Error("El servidor devolvió un flujo no conocido");
      }
    } catch (err) {
      setError(err.message || "Código de autenticación en dos pasos inválido");
    } finally {
      setLoading(false);
    }
  };
  return { code, setCode, loading, error, setError, verifyCode };
};
