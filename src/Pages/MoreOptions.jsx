import { useNavigate } from "react-router-dom";
import OptionCard from "../Components/Molecules/OptionCard";
import Button from "../Components/Atoms/Button";
import TextField from "../Components/Atoms/TextField";
import Alert from "../Components/Atoms/Alerts";
import TwoFactorAuth from "./Auth/TwoFactorAuth";
import ChangePasswordModal from "../Components/Organism/ChangePasswordModal";
import eye from "/showEye.svg";
import hideEye from "/hideEye.svg";
import { useTwoFactorAuthOptions } from "../hooks/Organism/useMoreOptions";

const MoreOptions = () => {
  const navigate = useNavigate();
  const {
    showTwoFactorAuthModal,
    showDisableModal,
    showPassword,
    password,
    isTwoFactorAuthActive,
    loading,
    error,
    setError,
    successMessage,
    handleDisable,
    handleEnableSuccess,
    handleCancelDisable,
    showChangePasswordModal,
    setShowChangePasswordModal,
    changePasswordLoading,
    changePasswordErrors,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    showCurrentPassword,
    showNewPassword,
    showConfirmPassword,
    handleCloseChangePasswordModal,
    handleSubmitChangePassword,
  } = useTwoFactorAuthOptions();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Otras opciones</h1>

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
                className="w-9 h-9 invert opacity-90"
              />
            }
            label="Certificaciones"
            onClick={() => navigate("/app/certificaciones")}
          />
          <OptionCard
            icon={
              <img
                src="/document.svg"
                alt="Documentos"
                className="w-9 h-9 invert opacity-90"
              />
            }
            label="Documentos"
            onClick={() => navigate("/app/documentos")}
          />
          <OptionCard
            icon={
              <img
                src="/key.svg"
                alt="TwoFactorAuth"
                className="w-9 h-9 invert opacity-90"
              />
            }
            label={
              <span className="whitespace-pre-line text-center block text-sm">
                {isTwoFactorAuthActive
                  ? "Desactivar doble\nverificación"
                  : "Activar doble\nverificación"}
              </span>
            }
            onClick={() => {
              setError("");
              if (isTwoFactorAuthActive) {
                showDisableModal.toggle();
              } else {
                showTwoFactorAuthModal.toggle();
              }
            }}
          />
          <OptionCard
            icon={
              <img
                src="/lock.svg"
                alt="Cambiar contraseña"
                className="w-9 h-9"
              />
            }
            label="Cambiar contraseña"
            onClick={() => {
              setError("");
              setShowChangePasswordModal(true);
            }}
          />
        </div>
      </div>

      {showTwoFactorAuthModal.value && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="relative">
            <button
              onClick={() => showTwoFactorAuthModal.toggle()}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 text-xl font-bold z-10"
            >
              ✕
            </button>
            <TwoFactorAuth onClose={handleEnableSuccess} />
          </div>
        </div>
      )}

      {showDisableModal.value && (
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
              type={showPassword.value ? "text" : "password"}
              value={password.value}
              setValue={password.handleValue}
              placeholder="Tu contraseña"
              text=""
              htmlFor="disable-password"
              iconRight={showPassword.value ? eye : hideEye}
              onIconRightClick={showPassword.toggle}
              iconRightAlt={
                showPassword.value ? "Ocultar contraseña" : "Mostrar contraseña"
              }
              iconRightAriaLabel={
                showPassword.value ? "Ocultar contraseña" : "Mostrar contraseña"
              }
            />

            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancelDisable}
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
        showCurrentPassword={showCurrentPassword.value}
        toggleCurrentPassword={showCurrentPassword.toggle}
        showNewPassword={showNewPassword.value}
        toggleNewPassword={showNewPassword.toggle}
        showConfirmPassword={showConfirmPassword.value}
        toggleConfirmPassword={showConfirmPassword.toggle}
      />
    </div>
  );
};

export default MoreOptions;
