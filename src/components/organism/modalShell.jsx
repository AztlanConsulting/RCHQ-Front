const ModalShell = ({
  isOpen,
  onClose,
  children,
  maxWidth = "max-w-xl",
  showCloseButton = true,
  closeOnBackdrop = true,
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = () => {
    if (closeOnBackdrop && typeof onClose === "function") {
      onClose();
    }
  };

  const handleContentClick = (event) => {
    event.stopPropagation();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="flex min-h-full items-center justify-center">
        <div
          className={`relative w-full ${maxWidth} max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-xl`}
          onClick={handleContentClick}
        >
          {showCloseButton && typeof onClose === "function" && (
            <button
              type="button"
              onClick={onClose}
              className="absolute right-8 top-8 z-10 text-xl font-bold text-slate-400 hover:text-slate-600"
              aria-label="Cerrar"
            >
              ✕
            </button>
          )}

          <div className="max-h-[90vh] overflow-y-auto p-8">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default ModalShell;
