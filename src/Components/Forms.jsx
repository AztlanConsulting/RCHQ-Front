// Components/Organism/Forms.jsx
import TextField from "../Atoms/TextField";
import Button from "./Atoms/Button";

const Forms = ({ title, fields = [], actions = [], footer, onSubmit }) => {

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();  // El estado ya vive en la Page, solo se notifica
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {title && (
        <h2 className="text-white text-xl font-bold">{title}</h2>
      )}

      {fields.map((field) => (
        <div key={field.id} className="relative h-[84px]">
          <TextField
            id={field.id}
            type={field.type || "text"}
            value={field.value}
            setValue={field.setValue}
            placeholder={field.placeholder}
            text={field.label}
            htmlFor={field.id}
            iconRight={field.iconRight || null}
            onIconRightClick={field.onIconRightClick}
            iconRightAlt={field.iconRightAlt}
            iconRightAriaLabel={field.iconRightAriaLabel}
          />
        </div>
      ))}

      {footer && <div>{footer}</div>}

      {actions.map((action, i) => (
        <Button
          key={i}
          type={action.type || "button"}
          disabled={action.disabled}
        >
          {action.text}
        </Button>
      ))}

    </form>
  );
};

export default Forms;