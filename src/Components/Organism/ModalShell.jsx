const ModalShell = ({
    isOpen,
    onClose,
    children,
    maxWidth = "max-w-md",
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={handleBackdropClick}
        >
            <div
                className={`relative w-full ${maxWidth} rounded-2xl bg-white p-8 shadow-xl`}
                onClick={handleContentClick}
            >
                {showCloseButton && typeof onClose === "function" && (
                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute right-8 top-8 text-xl font-bold text-slate-400 hover:text-slate-600"                        aria-label="Cerrar"
                    >
                        ✕
                    </button>
                )}

                {children}
            </div>
        </div>
    );
};

export default ModalShell;