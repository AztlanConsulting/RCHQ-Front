const TextField = ({ value, setValue, id, type = "text", placeholder,
  iconRight = null, onIconRightClick, iconRightAlt = "icono",
  iconRightAriaLabel, htmlFor = id, text = "" }) => {
  return (
    <div className="flex flex-col gap-1">  
      <label
        htmlFor={htmlFor}
        className="font-bold text-white text-base"  
      >
        {text}
      </label>

      <div className="h-[50px] flex items-center bg-neutral-50 rounded-lg shadow-[inset_0px_4px_4px_#00000040]">
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="flex-1 h-full ml-[19px] font-medium text-[#aaaaaa] text-base bg-transparent border-0 outline-none placeholder-[#aaaaaa]"
        />

        {iconRight && (
          onIconRightClick ? (
            <button type="button" onClick={onIconRightClick}
              aria-label={iconRightAriaLabel || iconRightAlt}
              className="mr-[13px] flex h-10 w-10 items-center justify-center rounded-lg bg-transparent">
              {typeof iconRight === "string"
                ? <img src={iconRight} alt={iconRightAlt} className="h-6 w-6" />
                : iconRight}
            </button>
          ) : (
            <div className="mr-[13px] flex items-center justify-center">
              {typeof iconRight === "string"
                ? <img src={iconRight} alt={iconRightAlt} className="h-6 w-6" />
                : iconRight}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default TextField;