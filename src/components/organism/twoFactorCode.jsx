import TextField from "../atoms/textField";
import Button from "../atoms/button";

const TwoFactorCode = ({ code, setCode, onSubmit, loading, disabled }) => {
  const handleChange = (value) => {
    const onlyNumbers = value.replace(/\D/g, "").slice(0, 6);
    setCode(onlyNumbers);
  };

  return (
    <div className="flex w-full flex-col items-center gap-5 sm:gap-6">
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
        wrapperClassName="w-full max-w-[19rem] sm:max-w-sm"
        containerClassName="min-h-[52px] px-4 sm:min-h-[50px]"
      />
      <Button
        text={loading ? "Verificando..." : "Verificar"}
        onClick={onSubmit}
        disabled={loading || disabled}
        bgColor="bg-[#1a2f5e]"
        hoverColor="hover:opacity-85"
        activeColor="active:opacity-70"
        textColor="text-white"
        width="w-full max-w-[19rem] sm:w-[206px]"
        textSize="text-lg sm:text-xl"
      />
    </div>
  );
};

export default TwoFactorCode;
