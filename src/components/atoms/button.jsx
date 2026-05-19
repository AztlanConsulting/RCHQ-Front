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
  height = "h-[50px]",
  width = "w-[206px]",
  textSize = "text-xl",
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
      className={`${width}
        ${height} 
        flex items-center justify-center rounded-lg overflow-hidden 
        cursor-pointer transition-all
        ${bgColor} ${hoverColor} ${activeColor} 
        disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {children ? (
        children
      ) : (
        <>
          {icon && <span className="flex items-center">{icon}</span>}
          <span className={`${fontWeight} ${textSize} ${textColor}`}>
            {text}
          </span>
        </>
      )}
    </button>
  );
};

export default Button;
