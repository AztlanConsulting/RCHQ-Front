import TextFieldGroup from "../Molecules/TextLabel";
import Button from "../Atoms/Button";

const TwoFactorCode = ({ code, setCode, onSubmit, loading }) => {
  return (
    <div className="flex flex-col items-center gap-6">
      <TextFieldGroup
        id="two-factor-code"
        label="Código de autenticación"
        type="text"
        value={code}
        setValue={setCode}
        placeholder="Ingresa el código"
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
