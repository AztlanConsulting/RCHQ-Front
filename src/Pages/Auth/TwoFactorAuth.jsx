import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TwoFactorCode from "../../Components/Organism/TwoFactorCode";
import Button from "../../Components/Atoms/Button";
import Alert from "../../Components/Atoms/Alerts";
import {
  verify2FAService,
  activateTwoFactorAuthService,
  skip2FAService,
  getToken,
} from "../../Services/AuthService";

const TwoFactorAuth = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState("prompt");
  const [code, setCode] = useState("");
  const [qr, setQr] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);
  
  const handleActivate = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await activateTwoFactorAuthService();

      if (!response) {
        setError("No se pudo iniciar la configuración de 2FA");
        return;
      }

      setQr(response.data?.qrImage || "");
      setStep("qr");
    } catch (err) {
      console.error(err);
      setError(err.message || "Error al generar el código QR");
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await skip2FAService();

      if (response?.nextStep === "LOGIN_COMPLETE") {
        navigate("/app/dashboard");
        return;
      }

      setError("No se pudo continuar sin activar 2FA");
    } catch (err) {
      console.error(err);
      setError(err.message || "Error al omitir la activación de 2FA");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await verify2FAService(code);

      if (!response) {
        setError("No se pudo validar el código");
        return;
      }

      if (response.nextStep === "2FA_SETUP_COMPLETE") {
        navigate("/app/dashboard");
        return;
      }

      setError("El servidor devolvió un flujo no reconocido");
    } catch (err) {
      console.error(err);
      setError(err.message || "Código 2FA inválido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1F3664] px-4">
      <div className="w-full max-w-md rounded-[32px] border border-slate-200 bg-white p-10 shadow-xl shadow-slate-950/40">
        {step === "prompt" && (
          <div className="text-center">
            <h1 className="mb-4 text-3xl font-semibold text-slate-900">
              Autenticación de dos factores
            </h1>

            <p className="mb-6 text-sm leading-6 text-slate-600">
              ¿Quieres activar la autenticación de dos factores?
            </p>

            {error && <Alert type="error" message={error} />}

            <div className="flex justify-center gap-4">
              <Button
                text={loading ? "Generando..." : "Sí, activar"}
                onClick={handleActivate}
                disabled={loading}
              />
              <Button
                text={loading ? "Continuando..." : "No, continuar"}
                onClick={handleSkip}
                disabled={loading}
              />
            </div>
          </div>
        )}

        {step === "qr" && (
        <div className="flex flex-col items-center gap-4">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-slate-900">
              Escanea el código QR
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Después ingresa el código generado por tu aplicación autenticadora.
            </p>
          </div>

          {error && <Alert type="error" message={error} />}

          {qr && (
            <img
              src={qr}
              alt="QR de configuración 2FA"
              className="h-36 w-36"
            />
          )}

          <TwoFactorCode
            code={code}
            setCode={setCode}
            onSubmit={handleSubmit}
            loading={loading}
          />
        </div>
      )}
      </div>
    </div>
  );
};

export default TwoFactorAuth;