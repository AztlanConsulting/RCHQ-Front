import TextField from "../atoms/textField";
import BigButton from "../atoms/bigButton";
import SmallButton from "../atoms/smallButton";

const Forms = ({
  title,
  description,
  fields = [],
  actions = [],
  footer,
  onSubmit,
  titleClassName = "text-center text-2xl font-bold text-white",
  descriptionClassName = "text-center text-sm text-white/80",
}) => {
  return (
    <form
      noValidate
      autoComplete="off"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="flex flex-col gap-6"
    >
      {title && <h2 className={titleClassName}>{title}</h2>}

      {description && <p className={descriptionClassName}>{description}</p>}

      {fields.map((field) => (
        <TextField
          key={field.id}
          id={field.id}
          value={field.value}
          setValue={field.setValue}
          placeholder={field.placeholder}
          type={field.type}
          iconRight={field.iconRight}
          onIconRightClick={field.onIconRightClick}
          iconRightAlt={field.iconRightAlt}
          iconRightAriaLabel={field.iconRightAriaLabel}
          htmlFor={field.htmlFor}
          text={field.text}
          autoComplete={field.autoComplete}
          inputMode={field.inputMode}
          maxLength={field.maxLength}
          labelClassName={field.labelClassName}
        />
      ))}

      {footer}

      {actions.length > 0 && (
        <div
          className={`mt-3 flex w-full items-center ${
            actions.length > 1 ? "flex-col gap-4" : "justify-center"
          }`}
        >
          {actions.map((action) => {
            const ButtonComponent = actions.length > 1 ? SmallButton : BigButton;

            return (
              <ButtonComponent
                key={action.id || action.text}
                text={action.text}
                type={action.type || "button"}
                onClick={action.onClick}
                disabled={action.disabled}
                white={action.white}
                hasNoRollback={action.hasNoRollback}
                cancel={action.cancel ?? action.text === "Cancelar"}
                className={action.className}
              />
            );
          })}
        </div>
      )}
    </form>
  );
};

export default Forms;
