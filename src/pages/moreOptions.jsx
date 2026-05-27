import { useNavigate } from "react-router-dom";
import OptionCard from "../components/molecules/optionCard";
import BigButton from "../components/atoms/bigButton";
import TextField from "../components/atoms/textField";
import Alert from "../components/atoms/alerts";
import TwoFactorAuth from "./auth/twoFactorAuth";
import ChangePasswordModal from "../components/organism/changePasswordModal";
import eye from "/showEye.svg";
import hideEye from "/hideEye.svg";
import { useTwoFactorAuthOptions } from "../hooks/organism/useMoreOptions";
import { useAuthContext } from "../context/authContext";

const MoreOptions = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
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
    <div className="p-4 sm:p-6 md:p-8">
      <h1 className="mb-5 text-2xl font-bold text-slate-900 sm:mb-6">
        Otras Opciones
      </h1>

      {successMessage && (
        <div className="mb-4">
          <Alert type="success" message={successMessage} />
        </div>
      )}

      <div className="min-h-96 rounded-2xl border border-slate-200 bg-transparent p-4 sm:p-6 md:min-h-[30rem] md:p-8">
        <div className="flex justify-center md:justify-start">
          <BigButton
            text="Regresar a mi perfil"
            onClick={() => navigate("/app/perfil")}
            className="w-full max-w-[18rem] md:w-auto"
          />
        </div>

        <div className="flex flex-wrap justify-center gap-4 pt-5 sm:gap-6 md:gap-14 md:pt-24">
          <OptionCard
            icon={
              <img
                src="/certificate.svg"
                alt="Certificaciones"
                className="h-8 w-8 invert opacity-90 sm:h-9 sm:w-9 md:h-7 md:w-7"
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
                className="h-8 w-8 invert opacity-90 sm:h-9 sm:w-9 md:h-7 md:w-7"
              />
            }
            label="Documentos"
            onClick={() => navigate(`/app/${user?.employeeId}/documentos`)}
          />
          <OptionCard
            icon={
              <img
                src="/key.svg"
                alt="TwoFactorAuth"
                className="h-8 w-8 invert opacity-90 sm:h-9 sm:w-9 md:h-7 md:w-7"
              />
            }
            label={
              <span className="block whitespace-pre-line text-center text-sm md:text-[0.8rem]">
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
                className="h-8 w-8 invert opacity-90 sm:h-9 sm:w-9 md:h-7 md:w-7"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-3 sm:p-4">
          <div className="relative my-3 sm:my-0">
            <button
              onClick={() => showTwoFactorAuthModal.toggle()}
              className="absolute right-4 top-4 z-10 text-lg font-bold text-slate-400 hover:text-slate-600 sm:right-6 sm:top-6 sm:text-xl"
            >
              ✕
            </button>
            <TwoFactorAuth onClose={handleEnableSuccess} />
          </div>
        </div>
      )}

      {showDisableModal.value && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-3 sm:p-4">
          <div className="my-3 w-full max-w-sm space-y-4 rounded-2xl bg-white p-5 shadow-xl sm:my-0 sm:p-8">
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
