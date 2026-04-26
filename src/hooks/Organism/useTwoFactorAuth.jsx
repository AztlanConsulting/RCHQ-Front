import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGenerateTwoFactorCode } from "../Molecules/useTwoFactorAuthGeneration";
import { useTwoFactorVerification } from "../Molecules/useTwoFactorAuthVerification";

export const useTwoFactorAuth = ({ onClose }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState("qr");

  const generation = useGenerateTwoFactorCode();

  const handleSuccess = () => {
    if (onClose) {
      onClose();
    } else {
      navigate("app/opciones");
    }
  };

  const verification = useTwoFactorVerification(handleSuccess);

  useEffect(() => {
    generation.generateQR();
  }, []);

  const handleGoToCode = () => {
    generation.setError("");
    setStep("code");
  };

  const handleGoToQr = () => {
    verification.setError("");
    setStep("qr");
  };

  return {
    step,
    handleGoToCode,
    handleGoToQr,

    // Estado de Generación
    qr: generation.qr,
    manualCode: generation.manualCode,
    isGenerating: generation.loading,
    generationError: generation.error,

    // Estado de Verificación
    code: verification.code,
    setCode: verification.setCode,
    isVerifying: verification.loading,
    verificationError: verification.error,
    submitCode: verification.verifyCode,
  };
};
