import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PasswordForm from "../../Components/Organism/PasswordForm";
import { getFirstLoginToken, setPreTwoFactorAuthToken } from "../../utils/authStorage";
import { changePasswordFirstLoginService } from "../../Services/PasswordService";
import useAuth from "../../hooks/useAuth";
import {
  firstLoginChangePasswordSchema,
  getFirstSchemaError,
} from "../../utils/Schema/Auth/password.schemas";
import { mapPasswordApiError } from "../../utils/password/passwordErrorMapper";

const ChangePassword = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const token = getFirstLoginToken();
    if (!token) {
      navigate("/iniciar-sesion", { replace: true });
    }
  }, [navigate]);

  const toggleNewPassword = () => setShowNewPassword((value) => !value);
  const toggleConfirmPassword = () =>
    setShowConfirmPassword((value) => !value);

  const handleSubmit = async ({ newPassword, confirmPassword }) => {
    setLoading(true);
    setErrors([]);

    const validation = firstLoginChangePasswordSchema.safeParse({
      newPassword,
      confirmPassword,
    });

    if (!validation.success) {
      setErrors([
        getFirstSchemaError(validation) || "Revisa los campos del formulario",
      ]);
      setLoading(false);
      return;
    }

    try {
      const response = await changePasswordFirstLoginService(
        newPassword,
        confirmPassword,
      );

      if (response?.nextStep === "VERIFY_TwoFactorAuth") {
        const preTwoFactorAuthToken = response?.data?.preTwoFactorAuthToken;

        if (!preTwoFactorAuthToken) {
          setErrors(["No se recibió un token válido para continuar con 2FA"]);
          return;
        }

        setPreTwoFactorAuthToken(preTwoFactorAuthToken);
        navigate("/2FA", { replace: true });
        return;
      }

      const token = response?.data?.token;
      const user = response?.data?.user;

      if (!token) {
        setErrors(["No se recibió un token de sesión válido"]);
        return;
      }

      login({ token, user });
      navigate("/app/dashboard", { replace: true });
    } catch (err) {
      console.error(err);
      setErrors(mapPasswordApiError(err, "first-login"));
    } finally {
      setLoading(false);
    }
  };

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
