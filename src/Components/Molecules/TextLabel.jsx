import Label from "../Atoms/Label";
import TextField from "../Atoms/TextField";

const TextFieldGroup = ({
  value,
  setValue,
  label,
  placeholder,
  iconRight,
  onIconRightClick,
  iconRightAlt,
  iconRightAriaLabel,
  id,
  type = "text",
}) => {
  return (
    <div className="relative w-full h-[118px] px-4">
      <Label text={label} htmlFor={id} />
      <TextField
        id={id}
        type={type}
        value={value}
        setValue={setValue}
        placeholder={placeholder}
        iconRight={iconRight}
        onIconRightClick={onIconRightClick}
        iconRightAlt={iconRightAlt}
        iconRightAriaLabel={iconRightAriaLabel}
      />
    </div>
  );
};

export default TextFieldGroup;