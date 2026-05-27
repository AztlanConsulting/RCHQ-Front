const ModalCloseButton = ({
  onClick,
  className = "",
  ariaLabel = "Close modal",
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`cursor-pointer text-[1.75rem] leading-none ${className}`}
    aria-label={ariaLabel}
  >
    &times;
  </button>
);

export default ModalCloseButton;
