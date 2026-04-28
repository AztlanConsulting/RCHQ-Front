import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useField } from "../Atoms/useField";
import {
  activateTwoFactorAuthService,
  verifyTwoFactorAuthService,
} from "../../Services/AuthService";

const useGeneration = () => {
  const [qr, setQr] = useState("");
  const [manualCode, setManualCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generateQR = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await activateTwoFactorAuthService();
      if (!response) {
        setError(
          "No se pudo iniciar la configuración de autenticación en dos pasos",
        );
        return;
      }
      setQr(response.data?.qrImage || "");
      const secret =
        response.data?.otpauthUrl?.match(/secret=([^&]+)/)?.[1] || "";
      setManualCode(secret);
    } catch (err) {
      setError(err.message || "Error al generar el código QR");
    } finally {
      setLoading(false);
    }
  };

  return { qr, manualCode, loading, error, setError, generateQR };
};

const useVerification = (onSuccess) => {
  const { value: code, handleValue: setCode } = useField(6);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const verifyCode = async () => {
    if (code.length !== 6) {
      setError("El código debe tener 6 dígitos.");
      return;
    }
    if (isNaN(Number(code))) {
      setError("El código debe ser número");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await verifyTwoFactorAuthService(code);
      if (!response) throw new Error("No se pudo validar el código");
      if (response.nextStep === "TwoFactorAuth_SETUP_COMPLETE") {
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

export const useTwoFactorAuth = ({ onClose }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState("qr");

  const generation = useGeneration();
  const verification = useVerification(() => {
    if (onClose) onClose();
    else navigate("app/opciones");
  });

  useEffect(() => {
    generation.generateQR();
  }, []);

  return {
    step,
    handleGoToCode: () => {
      generation.setError("");
      setStep("code");
    },
    handleGoToQr: () => {
      verification.setError("");
      setStep("qr");
    },
    qr: generation.qr,
    manualCode: generation.manualCode,
    isGenerating: generation.loading,
    generationError: generation.error,
    code: verification.code,
    setCode: verification.setCode,
    isVerifying: verification.loading,
    verificationError: verification.error,
    submitCode: verification.verifyCode,
  };
};
