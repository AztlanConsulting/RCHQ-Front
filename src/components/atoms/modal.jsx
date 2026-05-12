import { useEffect } from "react";
import { createPortal } from "react-dom";

const Modal = ({
    open,
    onClose,
    children,
    title,
    className = "",
}) => {
    useEffect(() => {
        if (!open) return;

        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                onClose?.();
            }
        };

        document.addEventListener("keydown", handleKeyDown);

        // Prevent body scroll while modal is open
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "";
        };
    }, [open, onClose]);

    if (!open) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50"
                onClick={onClose}
            />

            {/* Modal Panel */}
            <div
                role="dialog"
                aria-modal="true"
                className={`
                    relative z-10
                    w-full max-w-2xl
                    rounded-xl bg-white shadow-xl
                    p-6
                    max-h-[90vh]
                    overflow-y-auto
                    mx-4
                    ${className}
                `}
            >
                {/* Header */}
                {(title || onClose) && (
                    <div className="mb-4 flex items-center justify-between">
                        {title && (
                            <h2 className="text-xl font-semibold">
                                {title}
                            </h2>
                        )}

                        <button
                            type="button"
                            onClick={onClose}
                            className="text-2xl leading-none"
                            aria-label="Close modal"
                        >
                            ×
                        </button>
                    </div>
                )}

                {/* Content */}
                <div>{children}</div>
            </div>
        </div>,
        document.body
    );
};

export default Modal;