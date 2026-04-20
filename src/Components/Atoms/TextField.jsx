import { useRef } from "react";

const TextField = ({
  value,
  setValue,
  id,
  type = "text",
  placeholder,
  iconRight = null,
  onIconRightClick,
  iconRightAlt = "icono",
  iconRightAriaLabel,
  htmlFor = id,
  text = "",
  autoComplete,
  inputMode,
  maxLength,
}) => {
  const inputRef = useRef(null);

  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  return (
    <div className="flex w-full flex-col gap-1.5">
      <label
        htmlFor={htmlFor}
        className="text-sm font-bold text-white sm:text-base"
      >
        {text}
      </label>

      <div
        onClick={handleContainerClick}
        className="flex min-h-[50px] w-full cursor-text items-center rounded-lg bg-neutral-50 px-4 shadow-[inset_0px_4px_4px_#00000040]"
      >
        <input
          ref={inputRef}
          id={id}
          type={type}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          inputMode={inputMode}
          maxLength={maxLength}
          className="h-full w-full flex-1 bg-transparent border-0 outline-none text-sm font-medium text-[#222] placeholder-[#aaaaaa] sm:text-base"
        />

        {iconRight &&
          (onIconRightClick ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onIconRightClick();
              }}
              aria-label={iconRightAriaLabel || iconRightAlt}
              className="ml-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-transparent"
            >
              {typeof iconRight === "string" ? (
                <img
                  src={iconRight}
                  alt={iconRightAlt}
                  className="h-5 w-5 sm:h-6 sm:w-6"
                />
              ) : (
                iconRight
              )}
            </button>
          ) : (
            <div className="ml-3 flex shrink-0 items-center justify-center">
              {typeof iconRight === "string" ? (
                <img
                  src={iconRight}
                  alt={iconRightAlt}
                  className="h-5 w-5 sm:h-6 sm:w-6"
                />
              ) : (
                iconRight
              )}
            </div>
          ))}
      </div>
    </div>
  );
};

export default TextField;
