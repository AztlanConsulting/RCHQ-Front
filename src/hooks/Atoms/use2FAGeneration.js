  import { UseState, UseCallback } from "react";
  import { activateTwoFactorAuthService } from "../../Services/AuthService";
  
  
  export const generate2FACode = () => {
  const [qr, setQr] = UseState("");
  const [manualCode, setManualCode] = UseState("");
  const [loading, setLoading] = UseState(false);
  const [error, setError] = UseState("");

  const generateQR = UseCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await activateTwoFactorAuthService();
      if (!response) {
        setError("No se pudo iniciar la configuración de autenticación en dos pasos");
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
  }, []);

  return {qr, manualCode, loading, error, setError, generateQR};

};