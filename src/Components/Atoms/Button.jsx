const Button = ({
  text,
  onClick,
  type = "button",
  disabled = false,
  bgColor = "bg-neutral-50",
  textColor = "text-[#121212]",
  hoverColor = "hover:bg-neutral-100",
  activeColor = "active:bg-neutral-200",
  height = "h-[50px]",
  fullWidth = false,
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${fullWidth ? "w-full" : "w-full max-w-60"}
        ${height}
        flex items-center justify-center rounded-lg overflow-hidden
        transition-colors
        ${bgColor} ${hoverColor} ${activeColor}
        disabled:cursor-not-allowed disabled:opacity-60
      `}
    >
      <span className={`font-bold text-base sm:text-lg ${textColor}`}>
        {text}
      </span>
    </button>
  );
};

export default Button;