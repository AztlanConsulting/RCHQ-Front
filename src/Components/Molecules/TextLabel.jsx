import Label from "./atoms/Label";
import TextField from "./atoms/TextField";

const TextFieldGroup = ({
  value,
  setValue,
  label,
  placeholder,
  iconRight,
  id,
}) => {
  return (
    <div className="relative w-[500px] h-[118px]">
      
      <Label text={label} htmlFor={id} />

      <TextField
        id={id}
        value={value}
        setValue={setValue}
        placeholder={placeholder}
        iconRight={iconRight}
      />

    </div>
  );
};

export default TextFieldGroup;