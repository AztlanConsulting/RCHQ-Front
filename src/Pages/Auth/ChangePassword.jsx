import PasswordForm from "../../Components/Organism/PasswordForm";
import { useChangePassword } from "../../hooks/Organism/useChangePassowrd";

const ChangePassword = () => {
  const {
    loading,
    errors,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    showNewPassword,
    toggleNewPassword,
    showConfirmPassword,
    toggleConfirmPassword,
    handleSubmit,
  } = useChangePassword();

  return (
    <div className="min-h-screen bg-[#1F3664] px-4 py-12">
      <div className="mx-auto max-w-xl rounded-[32px] border border-slate-200 bg-white p-10 shadow-xl shadow-slate-950/40">
        <PasswordForm
          mode="first-login"
          title="Primer inicio de sesión"
          description="Por seguridad, debes cambiar tu contraseña antes de continuar."
          loading={loading}
          errors={errors}
          onSubmit={handleSubmit}
          submitText="Cambiar contraseña"
          newPassword={newPassword}
          setNewPassword={setNewPassword}
          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}
          showNewPassword={showNewPassword}
          toggleNewPassword={toggleNewPassword}
          showConfirmPassword={showConfirmPassword}
          toggleConfirmPassword={toggleConfirmPassword}
        />
      </div>
    </div>
  );
};

export default ChangePassword;
