import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import OptionCard from "../Components/Molecules/OptionCard";
import Button from "../Components/Atoms/Button";
import Alert from "../Components/Atoms/Alerts";
import TwoFactorAuth from "./Auth/TwoFactorAuth";
import { getStatus2FA, desactivate2FAService } from "../Services/AuthService";

const MoreOptions = () => {
  const navigate = useNavigate();
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [is2FAActive, setIs2FAActive] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await getStatus2FA();
        setIs2FAActive(response.Status2FA ?? false);
        console.log("2fa: ", is2FAActive);
      } catch (err) {
        console.error("Error al obtener estado 2FA:", err);
      }
    };
    fetchStatus();
  }, []);

  const handleDisable = async () => {
    if (!password) {
      setError("Ingresa tu contraseña para continuar");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await desactivate2FAService(password);
      if (response.nextStep === "2FA_DISABLED") {
        setIs2FAActive(false);
        setShowDisableModal(false);
        setPassword("");
      }
    } catch (err) {
      setError(err.message || "Error al desactivar 2FA");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Otras Opciones</h1>

      <div className="bg-transparent rounded-2xl border border-slate-200 p-8 min-h-96">
        <Button
          text="Regresar a mi perfil"
          onClick={() => navigate("/app/perfil")}
          bgColor="bg-[#1e2b4d]"
          hoverColor="hover:bg-[#15203b]"
          activeColor="active:bg-[#0f172a]"
          textColor="text-white"
        />

        <div className="flex gap-6 justify-center flex-wrap pt-4">
          <OptionCard
            icon={<img src="/certificate.svg" alt="Certificaciones" className="w-9 h-9" />}
            label="Certificaciones"
            onClick={() => navigate("/app/certificaciones")}
          />
          <OptionCard
            icon={<img src="/document.svg" alt="Documentos" className="w-9 h-9" />}
            label="Documentos"
            onClick={() => navigate("/app/documentos")}
          />

          {/* ← condicional correcto: un solo OptionCard con onClick distinto */}
          <OptionCard
            icon={<img src="/key.svg" alt="2FA" className="w-9 h-9" />}
            label={is2FAActive ? "Desactivar 2FA" : "Activar 2FA"}
            onClick={() => {
              setError("");
              if (is2FAActive) {
                setShowDisableModal(true);
              } else {
                setShow2FAModal(true);
              }
            }}
          />
        </div>
      </div>

      {/* Modal activar 2FA */}
      {show2FAModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="relative">
            <button
              onClick={() => setShow2FAModal(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 text-xl font-bold z-10"
            >
              ✕
            </button>
            <TwoFactorAuth
              onClose={() => {
                setShow2FAModal(false);
                setIs2FAActive(true); // ← actualizar estado al completar
              }}
            />
          </div>
        </div>
      )}

      {/* Modal desactivar 2FA */}
      {showDisableModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-xl space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">
              Desactivar autenticación en dos pasos
            </h3>
            <p className="text-sm text-slate-500">
              Ingresa tu contraseña para confirmar.
            </p>

            {error && <Alert type="error" message={error} />}

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Tu contraseña"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
            />

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setShowDisableModal(false); setPassword(""); setError(""); }}
                className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900"
              >
                Cancelar
              </button>
              <button
                onClick={handleDisable}
                disabled={loading}
                className="px-4 py-2 text-sm font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-60"
              >
                {loading ? "Verificando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MoreOptions;