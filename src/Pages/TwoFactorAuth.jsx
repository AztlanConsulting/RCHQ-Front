import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TwoFactorForm from "../Components/Organism/TwoFactorForm";
import Button from "../Components/Atoms/Button";
import {
  verify2FAService,
  activateTwoFactorAuthService,
  skip2FAService
} from "../Services/AuthService";

const TwoFactorAuth = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState("prompt"); 
  const [code, setCode] = useState("");
  const [qr, setQr] = useState("");
  const [loading, setLoading] = useState(false);

  // 👉 Activar 2FA
  const handleActivate = async () => {
    const response = await activateTwoFactorAuthService();

    if (response) {
      setQr(response.qr);
      setStep("qr");
    }
  };

  // 👉 Saltar 2FA
  const handleSkip = async () => {
    const response = await skip2FAService();

    if (response) {
      // guardar token real aquí
      navigate("/app/dashboard");
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    const response = await verify2FAService(code);

    if (!response) {
      setLoading(false);
      return;
    }

    // guardar token real aquí
    navigate("/app/dashboard");
    setLoading(false);
  };

  return (
    <div className="flex h-screen items-center justify-center">

      {step === "prompt" && (
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">
            Autenticación de Dos Factores
          </h1>

          <p className="mb-4">
            ¿Quieres activar la autenticación de dos factores?
          </p>

          <div className="flex gap-4 justify-center">
            <Button text="Sí, activar" onClick={handleActivate} />
            <Button text="No, continuar" onClick={handleSkip} />
          </div>
        </div>
      )}

      {step === "qr" && (
        <div className="flex flex-col items-center gap-6">

          <h2 className="text-xl font-semibold">
            Escanea el código QR
          </h2>

          <img src={qr} alt="QR" className="w-48 h-48" />

          <TwoFactorForm
            code={code}
            setCode={setCode}
            onSubmit={handleSubmit}
            loading={loading}
          />
        </div>
      )}
    </div>
  );
};

export default TwoFactorAuth;