import TextFieldGroup from "../Molecules/TextLabel";
import Button from "../Atoms/Button";

const Forms = ({
  title,
  description,
  fields = [],
  actions = [],
  footer,
  onSubmit,
}) => {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="flex flex-col gap-6"
    >
      {title && (
        <h2 className="text-center text-xl font-bold text-white">{title}</h2>
      )}

      {description && (
        <p className="text-center text-sm text-white/80">{description}</p>
      )}

      {fields.map((field) => (
        <TextFieldGroup
          key={field.id}
          id={field.id}
          label={field.label}
          value={field.value}
          setValue={field.setValue}
          placeholder={field.placeholder}
          type={field.type}
          iconRight={field.iconRight}
          onIconRightClick={field.onIconRightClick}
          iconRightAlt={field.iconRightAlt}
          iconRightAriaLabel={field.iconRightAriaLabel}
        />
      ))}

      {footer}

      {actions.length > 0 && (
        <div
          className={`flex items-center ${
            actions.length > 1
              ? "flex-col gap-4"
              : "justify-center"
          }`}
        >
          {actions.map((action) => (
            <Button
              key={action.id || action.text}
              text={action.text}
              type={action.type || "button"}
              onClick={action.onClick}
              disabled={action.disabled}
              bgColor={action.bgColor}
              textColor={action.textColor}
              hoverColor={action.hoverColor}
              activeColor={action.activeColor}
            />
          ))}
        </div>
      )}
    </form>
  );
};

export default Forms;
