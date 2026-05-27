const ModalCloseButton = ({
  onClick,
  className = "",
  ariaLabel = "Close modal",
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`cursor-pointer text-[1.75rem] leading-none text-slate-400 transition-colors hover:text-slate-700 ${className}`}
    aria-label={ariaLabel}
  >
    ×
  </button>
);

export default ModalCloseButton;
