const BigButton = ({
  text,
  onClick,
  type = "button",
  disabled = false,
  white = false,
  hasNoRollback = false,
  title,
  className = "",
}) => {
  const colors = hasNoRollback
    ? "bg-[#A20000] text-white hover:bg-[#870000] active:bg-[#6B0000]"
    : white
      ? "border border-[#24375e] bg-white text-[#24375e] hover:border-[#162d4a] hover:bg-[#EEF3FA] active:bg-[#DDE7F3]"
      : "bg-[#24375e] text-white hover:bg-[#162d4a] active:bg-[#0f2035]";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`inline-flex h-[50px] items-center justify-center rounded-lg px-6 !text-lg font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${colors} ${className}`}
    >
      {text}
    </button>
  );
};

export default BigButton;
