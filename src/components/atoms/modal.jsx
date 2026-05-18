import { useEffect } from "react";
import { createPortal } from "react-dom";

const placements = {
    "center": "fixed inset-0 z-50 flex items-center justify-center",
    "right": "fixed inset-0 z-50 flex items-center justify-end pr-4 md:pr-12 lg:pr-20",
    "left": "fixed inset-0 z-50 flex items-center justify-start"
}

const Modal = ({
    open,
    onClose,
    children,
    title,
    grayBackground = true,
    placement = "center",
    className = "",
    backdropClassName = "bg-black/50",
}) => {
    useEffect(() => {
        if (!open) return;

        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                onClose?.();
            }
        };

        document.addEventListener("keydown", handleKeyDown);

        if (grayBackground) {
            document.body.style.overflow = "hidden";
        }

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "";
        };
    }, [open, onClose, grayBackground]);

    if (!open) return null;

    return createPortal(
        <div
            className={`${placements[placement] || placements.center} ${
                grayBackground ? "" : "pointer-events-none"
            }`}
        >
            {grayBackground ? (
                <div
                    className={`absolute inset-0 pointer-events-auto ${backdropClassName}`}
                    onClick={onClose}
                    aria-hidden
                />
            ) : null}

            <div
                role="dialog"
                aria-modal={grayBackground}
                className={`
                    pointer-events-auto
                    relative z-10
                    w-full max-w-2xl
                    rounded-xl bg-white shadow-xl
                    p-[30px] md:p-8
                    max-h-[90vh]
                    overflow-y-auto
                    mx-4
                    ${className}
                `}
            >
                {(title || onClose) && (
                    <div
                        className={`mb-4 flex items-center ${
                            title ? "justify-between" : "justify-end"
                        }`}
                    >
                        {title && (
                            <h2 className="text-xl font-semibold">
                                {title}
                            </h2>
                        )}

                        <button
                            type="button"
                            onClick={onClose}
                            className="cursor-pointer text-[1.75rem] leading-none"
                            aria-label="Close modal"
                        >
                            ×
                        </button>
                    </div>
                )}

                <div>{children}</div>
            </div>
        </div>,
        document.body
    );
};

export default Modal;
