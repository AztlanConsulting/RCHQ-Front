import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Forms from "../../Components/Organism/Forms";
import { getReadableErrors } from "../../utils/apiErrors";
import { getFirstLoginToken } from "../../utils/authStorage";
import { changePasswordFirstLoginService } from "../../Services/PasswordService";
import Alert from "../../Components/Atoms/Alerts";
import eye from "/showEye.svg";
import hideEye from "/hideEye.svg";
import useAuth from "../../hooks/useAuth";

const ChangePassword = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const token = getFirstLoginToken();
    if (!token) {
      navigate("/iniciar-sesion", { replace: true });
    }
  }, [navigate]);

  const toggleShowNewPassword = () => {
    setShowNewPassword((value) => !value);
  };

  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword((value) => !value);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setErrors([]);

    try {
      const response = await changePasswordFirstLoginService(
        newPassword,
        confirmPassword,
      );

      const token = response?.data?.token;
      const user = response?.data?.user;

      if (!token) {
        setErrors(["No se recibió un token de sesión válido"]);
        return;
      }

      login({ token, user });

      // Por ahora ignoramos el prompt opcional de 2FA y continuamos
      navigate("/app/dashboard", { replace: true });
    } catch (err) {
      console.error(err);
      setErrors(getReadableErrors(err));
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    {
      id: "newPassword",
      type: showNewPassword ? "text" : "password",
      value: newPassword,
      setValue: setNewPassword,
      placeholder: "Ingresa tu nueva contraseña",
      iconRight: showNewPassword ? hideEye : eye,
      onIconRightClick: toggleShowNewPassword,
      iconRightAlt: showNewPassword
        ? "Ocultar contraseña"
        : "Mostrar contraseña",
      iconRightAriaLabel: showNewPassword
        ? "Ocultar contraseña"
        : "Mostrar contraseña",
      htmlFor: "newPassword",
      text: "Nueva contraseña",
      maxLength: 64,
      autoComplete: "new-password",
    },
    {
      id: "confirmPassword",
      type: showConfirmPassword ? "text" : "password",
      value: confirmPassword,
      setValue: setConfirmPassword,
      placeholder: "Confirma tu nueva contraseña",
      iconRight: showConfirmPassword ? hideEye : eye,
      onIconRightClick: toggleShowConfirmPassword,
      iconRightAlt: showConfirmPassword
        ? "Ocultar contraseña"
        : "Mostrar contraseña",
      iconRightAriaLabel: showConfirmPassword
        ? "Ocultar contraseña"
        : "Mostrar contraseña",
      htmlFor: "confirmPassword",
      text: "Confirmar nueva contraseña",
      maxLength: 64,
      autoComplete: "new-password",
    },
  ];

  return (
    <div className="min-h-screen bg-[#1F3664] px-4 py-12">
      <div className="mx-auto max-w-xl rounded-[32px] border border-slate-200 bg-white p-10 shadow-xl shadow-slate-950/40">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold text-slate-900">
            Primer inicio de sesión
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Por seguridad, debes cambiar tu contraseña antes de continuar.
          </p>
        </div>

        {errors.length > 0 && (
          <Alert
            type="error"
            message={
              <ul className="list-disc pl-5">
                {errors.map((item, index) => (
                  <li key={`${item}-${index}`}>{item}</li>
                ))}
              </ul>
            }
          />
        )}

        <Forms
          fields={fields}
          actions={[
            {
              text: loading ? "Cambiando..." : "Cambiar contraseña",
              type: "submit",
              disabled: loading,
              bgColor: "bg-[#1F3664]",
              textColor: "text-white",
              hoverColor: "hover:bg-[#1F3664]/90",
              activeColor: "active:bg-[#1F3664]/80",
            },
          ]}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
};

export default ChangePassword;
