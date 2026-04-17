import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Forms from "../../Components/Organism/Forms";
import { loginService, getReadableErrors } from "../../Services/AuthService";
import Alert from "../../Components/Atoms/Alerts";
import eye from "/showEye.svg";
import hideEye from "/hideEye.svg";

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [showPassword, setShowPassword] = useState(false);

  const toggleShowPassword = () => {
    setShowPassword((value) => !value);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setErrors([]);

    try {
      const response = await loginService(email, password);

      if (!response?.success) {
        setErrors(["No se pudo iniciar sesión"]);
        return;
      }

      if(response.isActive2FA){
        navigate("/2FA")
        return;
      }

      navigate("/app/dashboard");
    } catch (err) {
      console.error(err);

      if (err.status === 423) {
        setErrors(["Tu cuenta está bloqueada temporalmente. Intenta más tarde."]);
      } else {
        setErrors(getReadableErrors(err));
      }
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    {
      id: "email",
      label: "Correo electrónico",
      value: email,
      setValue: setEmail,
      placeholder: "Ingresa tu correo",
      htmlFor: "email",
      text: "Correo electrónico",
    },
    {
      id: "password",
      label: "Contraseña",
      value: password,
      setValue: setPassword,
      placeholder: "Ingresa tu contraseña",
      type: showPassword ? "text" : "password",
      iconRight: showPassword ? eye : hideEye,
      onIconRightClick: toggleShowPassword,
      iconRightAlt: showPassword
        ? "Ocultar contraseña"
        : "Mostrar contraseña",
      iconRightAriaLabel: showPassword
        ? "Ocultar contraseña"
        : "Mostrar contraseña",
      htmlFor: "password",
      text: "Contraseña",
    },
  ];

  const actions = [
    {
      text: loading ? "Cargando..." : "Ingresar",
      type: "submit",
      disabled: loading,
    },
  ];

  return (
    <div className="flex h-screen">
      <div className="w-1/2 bg-white flex items-center justify-center">
        <img src="/RCHQ-LOGO.svg" style={{ mixBlendMode: "darken" }} alt="logo" />
      </div>

      <div className="w-1/2 bg-blue-900 flex items-center justify-center">
        <div className="w-full max-w-md space-y-4">
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
            title="Bienvenido de Vuelta"
            fields={fields}
            footer={
              <p className="cursor-pointer text-right text-sm text-white hover:underline">
                ¿Has olvidado tu contraseña?
              </p>
            }
            actions={actions}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;