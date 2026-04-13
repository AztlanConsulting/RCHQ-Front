import TextFieldGroup from "../Molecules/TextLabel";
import Button from "../Atoms/Button";

const LoginForms = ({
  email,
  setEmail,
  password,
  setPassword,
  onSubmit,
  loading,
}) => {
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
        label="Contraseña"
        value={password}
        setValue={setPassword}
        placeholder="Ingresa tu contraseña"
      />

      <div className="text-right text-sm text-white cursor-pointer hover:underline">
        ¿Has olvidado tu contraseña?
      </div>

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