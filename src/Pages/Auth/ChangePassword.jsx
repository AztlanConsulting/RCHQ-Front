import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Forms from "../../Components/Organism/Forms";
import Button from "../../Components/Atoms/Button";
import {
  changePasswordService,
  getFirstLoginToken,
  getReadableErrors,
} from "../../Services/AuthService";
import Alert from "../../Components/Atoms/Alerts";
import eye from "/showEye.svg";
import hideEye from "/hideEye.svg";

const ChangePassword = () => {
  const navigate = useNavigate();
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
    if (newPassword !== confirmPassword) {
      setErrors([]);
      return;
    }

    setLoading(true);
    setErrors([]);

    try {
      const response = await changePasswordService(
        newPassword,
        confirmPassword,
      );

      if (
        response.nextStep === "SETUP_TwoFactorAuth_OPTIONAL" &&
        response.data.shouldPromptTwoFactorAuthSetup
      ) {
        navigate("/setup-2fa");
        return;
      }

      navigate("/app/dashboard");
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
      label: "Nueva contraseña",
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
    },
    {
      id: "confirmPassword",
      label: "Confirmar nueva contraseña",
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
    },
  ];

  return (
    <div className="min-h-screen bg-[#1F3664] shadow-[0_4px_6px_rgba(0,47,142,0.35)] px-4 py-12">
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
              text: loading ? "Cambiando..." : "Cambiar Contraseña",
              type: "submit",
              disabled: loading,
              bgColor: "bg-[#1F3664] shadow-[0_4px_6px_rgba(0,47,142,0.35)]",
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
