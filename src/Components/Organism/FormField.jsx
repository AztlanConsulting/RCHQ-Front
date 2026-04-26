import TextField from "../Atoms/TextField";

const FormField = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder = "",
  required = false,
  iconRight = null,
  onIconRightClick,
  maxLength,
  iconRightAlt = "icono",
  labelColor = "text-[#121212]",
  autoComplete = "off",
}) => {
  const handlesetValue = (val) => {
    const syntheticEvent = {
      target: { name, value: val },
    };
    onChange(syntheticEvent);
  };

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label htmlFor={name} className={`font-semibold text-sm ${labelColor}`}>
          {label}
          {required && (
            <span className="text-red-600 ml-0.5" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      <TextField
        id={name}
        htmlFor={name}
        type={type}
        value={value}
        setValue={handlesetValue}
        placeholder={placeholder}
        maxLength={maxLength}
        iconRight={iconRight}
        onIconRightClick={onIconRightClick}
        iconRightAlt={iconRightAlt}
        autoComplete={autoComplete}
      />
    </div>
  );
};

export default FormField;
