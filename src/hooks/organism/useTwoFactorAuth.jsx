import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useField } from "../atoms/useField";
import {
  activateTwoFactorAuthService,
  verifyTwoFactorAuthService,
} from "../../services/authService";

const useGeneration = () => {
  const [qr, setQr] = useState("");
  const [manualCode, setManualCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copySuccess, setCopySuccess] = useState("");

  const generateQR = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    if (!error) return;

    const timer = setTimeout(() => {
      setError("");
    }, 3000);

    return () => clearTimeout(timer);
  }, [error]);

  useEffect(() => {
    if (!copySuccess) return;

    const timer = setTimeout(() => {
      setCopySuccess("");
    }, 3000);

    return () => clearTimeout(timer);
  }, [copySuccess]);

  const copyManualCode = useCallback(async () => {
    if (!manualCode) return;

    try {
      await navigator.clipboard.writeText(manualCode);
      setCopySuccess("Clave copiada correctamente.");
    } catch {
      setError("No se pudo copiar la clave.");
    }
  }, [manualCode]);

  return {
    qr,
    manualCode,
    loading,
    error,
    copySuccess,
    setError,
    clearError: () => setError(""),
    clearCopySuccess: () => setCopySuccess(""),
    generateQR,
    copyManualCode,
  };
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
      if (response.nextStep === "TWO_FACTOR_AUTH_SETUP_COMPLETE") {
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

  useEffect(() => {
    if (!error) return;

    const timer = setTimeout(() => {
      setError("");
    }, 3000);

    return () => clearTimeout(timer);
  }, [error]);

  return {
    code,
    setCode,
    loading,
    error,
    setError,
    clearError: () => setError(""),
    verifyCode,
  };
};

export const useTwoFactorAuth = ({ onClose }) => {
  const navigate = useNavigate();
  const [openStep, setOpenStep] = useState("install");

  const generation = useGeneration();
  const verification = useVerification(() => {
    if (onClose) onClose();
    else navigate("app/opciones");
  });
  const { generateQR } = generation;
  const toggleStep = useCallback((stepId) => {
    setOpenStep((currentStep) => (currentStep === stepId ? "" : stepId));
  }, []);

  useEffect(() => {
    generateQR();
  }, [generateQR]);

  return {
    openStep,
    toggleStep,
    qr: generation.qr,
    manualCode: generation.manualCode,
    isGenerating: generation.loading,
    generationError: generation.error,
    copySuccessMessage: generation.copySuccess,
    clearGenerationError: generation.clearError,
    clearCopySuccessMessage: generation.clearCopySuccess,
    copyManualCode: generation.copyManualCode,
    code: verification.code,
    setCode: verification.setCode,
    isVerifying: verification.loading,
    verificationError: verification.error,
    clearVerificationError: verification.clearError,
    submitCode: verification.verifyCode,
  };
};
