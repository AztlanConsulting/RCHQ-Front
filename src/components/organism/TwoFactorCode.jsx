import TextField from "../atoms/TextField";
import Button from "../atoms/Button";

const TwoFactorCode = ({ code, setCode, onSubmit, loading, disabled }) => {
  const handleChange = (value) => {
    const onlyNumbers = value.replace(/\D/g, "").slice(0, 6);
    setCode(onlyNumbers);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <TextField
        id="two-factor-code"
        label="Código de autenticación"
        type="text"
        value={code}
        setValue={handleChange}
        placeholder="Ingresa el código"
        htmlFor="two-factor-code"
        text="Código de autenticación"
        disabled={disabled}
        maxLength={6}
      />
      <Button
        text={loading ? "Verificando..." : "Verificar"}
        onClick={onSubmit}
        disabled={loading || disabled}
        bgColor="bg-[#1d4ed8]"
        hoverColor="hover:bg-blue-800"
        textColor="text-white"
      />
    </div>
  );
};

export default TwoFactorCode;
