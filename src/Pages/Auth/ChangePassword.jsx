import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PasswordForm from "../../Components/Organism/PasswordForm";
import { getFirstLoginToken } from "../../utils/authStorage";
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

  useEffect(() => {
    const token = getFirstLoginToken();
    if (!token) {
      navigate("/iniciar-sesion", { replace: true });
    }
  }, [navigate]);

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

      if (response?.nextStep === "VERIFY_2FA") {
        const pre2FAToken = response?.data?.pre2FAToken;

        if (!pre2FAToken) {
          setErrors(["No se recibió un token válido para continuar con 2FA"]);
          return;
        }

        localStorage.setItem("PRE_2FA", pre2FAToken);
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
        />
      </div>
    </div>
  );
};

export default ChangePassword;
