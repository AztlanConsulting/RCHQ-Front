import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../Components/Atoms/Button";
import Alert from "../../Components/Atoms/Alerts";
import TwoFactorCode from "../../Components/Organism/TwoFactorCode";
import {
  verify2FAService,
  activateTwoFactorAuthService,
} from "../../Services/AuthService";

const TwoFactorAuth = ({ onClose }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState("qr");
  const [code, setCode] = useState("");
  const [qr, setQr] = useState("");
  const [manualCode, setManualCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    handleActivate();
  }, []);

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
      const secret = response.data?.otpauthUrl?.match(/secret=([^&]+)/)?.[1] || "";
      setManualCode(secret);
    } catch (err) {
      setError(err.message || "Error al generar el código QR");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (code.length !== 6) {
      setError("El código debe tener 6 dígitos");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await verify2FAService(code);
      if (!response) {
        setError("No se pudo validar el código");
        return;
      }
      if (response.nextStep === "2FA_SETUP_COMPLETE") {
        if (onClose) {
          onClose();
        } else {
          navigate("/app/opciones");
        }
        return;
      }
      setError("El servidor devolvió un flujo no reconocido");
    } catch (err) {
      setError(err.message || "Código 2FA inválido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-2xl p-8 w-[500px] max-w-full flex flex-col">
      {step === "qr" && (
        <>
          <div className="text-left w-full mb-6">
            <h2 className="text-2xl font-bold text-slate-900">
              2 Factor Authentication
            </h2>
            <p className="mt-2 text-sm text-slate-600 font-medium">
              Usa una aplicación de autentificación (ej. Google auth) y escanea el código QR.
            </p>
          </div>

          {error && <Alert type="error" message={error} />}

          <div className="flex flex-col items-center justify-center w-full">
            {loading ? (
              <div className="h-56 w-56 flex items-center justify-center text-sm text-slate-400 border border-slate-100 rounded-lg">
                Generando QR...
              </div>
            ) : qr ? (
              <img src={qr} alt="QR 2FA" className="h-56 w-56 object-contain" />
            ) : null}

            <div className="mt-6">
              <Button
                text="Continuar"
                onClick={() => { setError(""); setStep("code"); }}
                disabled={loading || !qr}
                bgColor="bg-[#1d4ed8]"
                hoverColor="hover:bg-blue-800"
                textColor="text-white"
                width="w-56"
                className="shadow-sm"
              />
            </div>
          </div>

          {manualCode && (
            <div className="w-full mt-6">
              <div className="flex items-center gap-3 w-full mb-2">
                <hr className="flex-1 border-slate-200" />
                <span className="text-xs font-semibold text-slate-400">o</span>
                <hr className="flex-1 border-slate-200" />
              </div>
                <div className="text-center flex flex-col items-center w-full px-4">
                <p className="text-sm font-medium text-slate-500 mb-2">Ingresa este código</p>
              <div className=" border-2 border-slate-100  rounded-lg px-4 py-3 w-full max-w-sm bg-slate-50 text-slate-800 font-bold tracking-[0.1em] break-all">                  
                {manualCode}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {step === "code" && (
        <div className="flex flex-col items-center gap-6 w-full">
          <div className="text-center w-full">
            <h2 className="text-2xl font-bold text-slate-900">
              Verifica el código
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Ingresa los 6 dígitos generados por tu aplicación:
            </p>
          </div>

          {error && <Alert type="error" message={error} />}

          <TwoFactorCode
            code={code}
            setCode={setCode}
            onSubmit={handleSubmit}
            loading={loading}
          />

          <Button
            text="Volver al QR"
            onClick={() => { setError(""); setStep("qr"); }}
            bgColor="bg-transparent"
            hoverColor="hover:bg-slate-50"
            activeColor="active:bg-slate-100"
            textColor="text-slate-500 hover:text-slate-700"
            width="w-auto"
            height="h-auto"
            textSize="text-sm"
            fontWeight="font-medium"
            className="mt-2 py-2 px-4"
          />
        </div>
      )}
    </div>
  );
};

export default TwoFactorAuth;