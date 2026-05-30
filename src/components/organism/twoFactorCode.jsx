import TextField from "../atoms/textField";
import BigButton from "../atoms/bigButton";

const TwoFactorCode = ({ code, setCode, onSubmit, loading, disabled }) => {
  const handleChange = (value) => {
    const onlyNumbers = value.replace(/\D/g, "").slice(0, 6);
    setCode(onlyNumbers);
  };

  return (
    <div className="flex w-full flex-col items-center gap-4 sm:gap-6">
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
        wrapperClassName="w-full max-w-none sm:max-w-sm"
        containerClassName="min-h-[50px] px-3.5 sm:min-h-[50px] sm:px-4"
      />
      <BigButton
        text={loading ? "Verificando..." : "Verificar"}
        onClick={onSubmit}
        disabled={loading || disabled}
        className="w-full  max-w-[19rem] sm:w-[206px]"
      />
    </div>
  );
};

export default TwoFactorCode;
