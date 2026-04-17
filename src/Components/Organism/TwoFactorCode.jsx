import TextField from "../Atoms/TextField";
import Button from "../Atoms/Button";

const TwoFactorCode = ({ code, setCode, onSubmit, loading, disabled }) => {
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
        disabled={disabled} 
      />
      <Button
        text={loading ? "Verificando..." : "Verificar"}
        onClick={onSubmit}
        disabled={loading || disabled}
      />
    </div>
  );
};

export default TwoFactorCode;