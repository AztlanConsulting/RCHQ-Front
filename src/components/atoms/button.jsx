const Button = ({
  text,
  title,
  onClick,
  type = "button",
  disabled = false,
  bgColor = "bg-neutral-50",
  textColor = "text-[#121212]",
  hoverColor = "hover:bg-neutral-200",
  activeColor = "active:bg-neutral-300",
  height = "h-[44px] sm:h-[50px]",
  width = "w-full sm:w-[206px]",
  textSize = "text-base sm:text-xl",
  fontWeight = "font-bold",
  className = "",
  icon = null,
  children,
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`
        ${width} ${height}
        flex items-center justify-center gap-2 rounded-lg overflow-hidden
        cursor-pointer transition-all
        ${bgColor} ${hoverColor} ${activeColor}
        disabled:cursor-not-allowed disabled:opacity-60
        ${className}
      `}
    >
      {children ? (
        children
      ) : (
        <>
          {icon && <span className="flex items-center shrink-0">{icon}</span>}
          <span className={`${fontWeight} ${textSize} ${textColor} leading-none`}>
            {text}
          </span>
        </>
      )}
    </button>
  );
};

export default Button;