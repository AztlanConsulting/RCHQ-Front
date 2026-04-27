import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import OptionCard from "../Components/Molecules/OptionCard";
import Button from "../Components/Atoms/Button";
import TextField from "../Components/Atoms/TextField";
import Alert from "../Components/Atoms/Alerts";
import TwoFactorAuth from "./Auth/TwoFactorAuth";
import ChangePasswordModal from "../Components/Organism/ChangePasswordModal";
import { getStatus2FA, desactivate2FAService } from "../Services/AuthService";
import { changePasswordService } from "../Services/PasswordService";
import { selfServiceChangePasswordSchema, getFirstSchemaError, } from "../utils/Schema/Auth/password.schemas";
import { mapPasswordApiError } from "../utils/password/passwordErrorMapper";
import eye from "/showEye.svg";
import hideEye from "/hideEye.svg";

const MoreOptions = () => {
  const navigate = useNavigate();
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [is2FAActive, setIs2FAActive] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);
  const [changePasswordErrors, setChangePasswordErrors] = useState([]);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const toggleShowPassword = () => setShowPassword((v) => !v);
  const toggleCurrentPassword = () => setShowCurrentPassword((value) => !value);
  const toggleNewPassword = () => setShowNewPassword((value) => !value);
  const toggleConfirmPassword = () => setShowConfirmPassword((value) => !value);

  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(() => setSuccessMessage(""), 4000);
    return () => clearTimeout(timer);
  }, [successMessage]);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await getStatus2FA();
        setIs2FAActive(response.Status2FA ?? false);
      } catch (err) {
        console.error("Error al obtener estado de la autentificación en dos pasos:", err);
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
        setShowPassword(false);
        setSuccessMessage(
          "La autenticación en dos pasos ha sido desactivada correctamente.",
        );
      }
    } catch (err) {
      setError(err.message || "Error al desactivar la autentificación en dos pasos");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseChangePasswordModal = () => {
    if (changePasswordLoading) return;

    setShowChangePasswordModal(false);
    setChangePasswordErrors([]);

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");

    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const handleSubmitChangePassword = async ({
    currentPassword,
    newPassword,
    confirmPassword,
  }) => {
    setChangePasswordLoading(true);
    setChangePasswordErrors([]);

    const validation = selfServiceChangePasswordSchema.safeParse({
      currentPassword,
      newPassword,
      confirmPassword,
    });

    if (!validation.success) {
      setChangePasswordErrors([
        getFirstSchemaError(validation) || "Revisa los campos del formulario",
      ]);
      setChangePasswordLoading(false);
      return;
    }

    try {
      const response = await changePasswordService(
        currentPassword,
        newPassword,
        confirmPassword,
      );

      if (!response?.success) {
        setChangePasswordErrors(["No se pudo cambiar la contraseña"]);
        return;
      }

      setSuccessMessage("La contraseña se actualizó correctamente.");
      handleCloseChangePasswordModal();
    } catch (err) {
      console.error(err);
      setChangePasswordErrors(mapPasswordApiError(err, "self-service"));
    } finally {
      setChangePasswordLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Otras opciones</h1>

      {/* Notificación de éxito */}
      {successMessage && (
        <div className="mb-4">
          <Alert type="success" message={successMessage} />
        </div>
      )}

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
            icon={
              <img
                src="/certificate.svg"
                alt="Certificaciones"
                className="w-9 h-9"
              />
            }
            label="Certificaciones"
            onClick={() => navigate("/app/certificaciones")}
          />
          <OptionCard
            icon={
              <img src="/document.svg" alt="Documentos" className="w-9 h-9" />
            }
            label="Documentos"
            onClick={() => navigate("/app/documentos")}
          />
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
          <OptionCard
            icon={<img src="/lock.svg" alt="Cambiar contraseña" className="w-9 h-9" />}
            label="Cambiar contraseña"
            onClick={() => {
              setError("");
              setShowChangePasswordModal(true);
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
                setIs2FAActive(true);
                setSuccessMessage(
                  "La autenticación en dos pasos ha sido activada correctamente.",
                ); 
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

            <TextField
              id="disable-password"
              type={showPassword ? "text" : "password"}
              value={password}
              setValue={setPassword}
              placeholder="Tu contraseña"
              text=""
              htmlFor="disable-password"
              iconRight={showPassword ? eye : hideEye}
              onIconRightClick={toggleShowPassword}
              iconRightAlt={
                showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
              }
              iconRightAriaLabel={
                showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
              }
            />

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDisableModal(false);
                  setPassword("");
                  setError("");
                  setShowPassword(false);
                }}
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
      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        onClose={handleCloseChangePasswordModal}
        loading={changePasswordLoading}
        errors={changePasswordErrors}
        onSubmit={handleSubmitChangePassword}
        currentPassword={currentPassword}
        setCurrentPassword={setCurrentPassword}
        newPassword={newPassword}
        setNewPassword={setNewPassword}
        confirmPassword={confirmPassword}
        setConfirmPassword={setConfirmPassword}
        showCurrentPassword={showCurrentPassword}
        toggleCurrentPassword={toggleCurrentPassword}
        showNewPassword={showNewPassword}
        toggleNewPassword={toggleNewPassword}
        showConfirmPassword={showConfirmPassword}
        toggleConfirmPassword={toggleConfirmPassword}
      />
    </div>
  );
};

export default MoreOptions;
