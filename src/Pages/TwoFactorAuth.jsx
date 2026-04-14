import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TwoFactorCode from "../Components/Organism/TwoFactorCode";
import Button from "../Components/Atoms/Button";
import {
  verify2FAService,
  activateTwoFactorAuthService,
  skip2FAService,
} from "../Services/AuthService";

const TwoFactorAuth = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState("prompt");
  const [code, setCode] = useState("");
  const [qr, setQr] = useState("");
  const [loading, setLoading] = useState(false);

  const handleActivate = async () => {
    try {
      const response = await activateTwoFactorAuthService();

      if (response) {
        setQr(response.qr);
        setStep("qr");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSkip = async () => {
    try {
      const response = await skip2FAService();

      if (response) {
        navigate("/app/dashboard");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    const response = await verify2FAService(code);

    if (!response) {
      setLoading(false);
      return;
    }

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

          <TwoFactorCode
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
