import TextField from "../Atoms/TextField";
import Button from "../Atoms/Button";

const TwoFactorCode = ({ code, setCode, onSubmit, loading }) => {
  return (
    <div className="flex flex-col items-center gap-6">
      <TextField
        id="two-factor-code"
        label="Código de autenticación"
        type="text"
        value={code}
        setValue={setCode}
        placeholder="Ingresa el código"
        htmlFor="two-factor-code"
        text="Código de autenticación"
      />
      <Button
        text={loading ? "Verificando..." : "Verificar"}
        onClick={onSubmit}
        disabled={loading}
      />
    </div>
  );
};

export default TwoFactorCode;
