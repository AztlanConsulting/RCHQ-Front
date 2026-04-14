import { useState } from "react";
import TextFieldGroup from "../Molecules/TextLabel";
import Button from "../Atoms/Button";
import eye from "/showEye.svg";
import hideEye from "/hideEye.svg";

const LoginForms = ({
  email,
  setEmail,
  password,
  setPassword,
  onSubmit,
  loading,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const toggleShowPassword = () => {
    setShowPassword((value) => !value);
  };

  const passwordToggleButton = (
    <button
      type="button"
      onClick={toggleShowPassword}
      className="flex h-10 w-10 items-center justify-center rounded-lg bg-transparent"
      aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
    >
      <img
        src={showPassword ? eye : hideEye}
        alt={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
        className="h-5 w-5"
      />
    </button>
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="flex flex-col gap-6"
    >
      <h2 className="text-white text-xl font-bold text-center">
        Bienvenido de Vuelta
      </h2>

      <TextFieldGroup
        id="email"
        label="Correo electrónico"
        value={email}
        setValue={setEmail}
        placeholder="Ingresa tu correo"
      />

      <TextFieldGroup
        id="password"
        type={showPassword ? "text" : "password"}
        label="Contraseña"
        iconRight={passwordToggleButton}
        value={password}
        setValue={setPassword}
        placeholder="Ingresa tu contraseña"
      />

      <p className="text-right text-sm text-white cursor-pointer hover:underline">
        ¿Has olvidado tu contraseña?
      </p>

      <center>
      <Button
        text={loading ? "Cargando..." : "Ingresar"}
        type="submit"
        disabled={loading}
      />
      </center>
    </form>
  );
};

export default LoginForms;