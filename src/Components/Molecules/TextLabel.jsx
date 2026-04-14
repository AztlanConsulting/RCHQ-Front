import Label from "../Atoms/Label";
import TextField from "../Atoms/TextField";

const TextFieldGroup = ({
  value,
  setValue,
  label,
  placeholder,
  iconRight,
  id,
  type = "text",
}) => {
  return (
    <div className="relative w-[500px] h-[118px]">
      
      <Label text={label} htmlFor={id} />

      <TextField
        id={id}
        type={type}
        value={value}
        setValue={setValue}
        placeholder={placeholder}
        iconRight={iconRight}
      />

    </div>
  );
};

export default TextFieldGroup;