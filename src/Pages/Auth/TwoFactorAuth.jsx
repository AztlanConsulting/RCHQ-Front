import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TwoFactorCode from "../../Components/Organism/TwoFactorCode";
import Button from "../../Components/Atoms/Button";
import Alert from "../../Components/Atoms/Alerts";
import {
  verify2FAService,
  activateTwoFactorAuthService,
} from "../../Services/AuthService";

const TwoFactorAuth = () => {
  const navigate = useNavigate();

  const [code, setCode] = useState("");
  const [qr, setQr] = useState("");
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
      // activateTwoFactorAuthService ya usa setupToken internamente

      if (!response) {
        setError("No se pudo iniciar la configuración de 2FA");
        return;
      }

      setQr(response.data?.qrImage || "");
    } catch (err) {
      console.error(err);
      setError(err.message || "Error al generar el código QR");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {

    if (code.length !== 6){
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-100 to-purple-100">
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
            {qr ? (
              <img
                src={qr}
                alt="QR de configuración 2FA"
                className="h-36 w-36"
              />
            ) : (
              <Button
                text={loading ? "Generando QR..." : "Generar QR"}
                onClick={handleActivate}
                disabled={loading}
              />
            )}

            <TwoFactorCode
              code={code}
              setCode={setCode}
              onSubmit={handleSubmit}
              loading={loading}
            />
          </div>
      </div>
  );
};

export default TwoFactorAuth;