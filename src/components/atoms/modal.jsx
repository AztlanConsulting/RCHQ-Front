import { useEffect } from "react";
import { createPortal } from "react-dom";
import Type from "./type";

const placements = {
    "center": "fixed inset-0 z-50 flex items-center justify-center",
    "right": "fixed inset-0 z-50 flex items-center justify-end",
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
                    className="absolute inset-0 bg-black/50 pointer-events-auto"
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
                    rounded-lg bg-white shadow-xl
                    pt-4 pl-6 pr-6 pb-6
                    max-h-[90vh]
                    overflow-y-auto
                    mx-4
                    ${className}
                `}
            >
                {(title || onClose) && (
                    <div className="mb-2 flex items-center justify-between">
                        {title ? (
                            <Type variant="subtitle" as="h2">
                                {title}
                            </Type>
                        ) : (
                            <p></p>
                        )}

                        <button
                            type="button"
                            onClick={onClose}
                            className="text-2xl leading-none cursor-pointer"
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