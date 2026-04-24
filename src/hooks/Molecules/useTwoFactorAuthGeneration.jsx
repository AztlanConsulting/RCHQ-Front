import { useState, useCallback } from "react";
import { activateTwoFactorAuthService } from "../../Services/AuthService";

export const useGenerateTwoFactorCode = () => {
  const [qr, setQr] = useState("");
  const [manualCode, setManualCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  return { qr, manualCode, loading, error, setError, generateQR };
};
