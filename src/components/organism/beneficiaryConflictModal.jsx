import ModalCloseButton from "../atoms/modalCloseButton";
import SmallButton from "../atoms/smallButton";

const BeneficiaryConflictModal = ({
    isOpen,
    message,
    onConfirm,
    onClose,
}) => {
    if (!isOpen) return null;

    const handleClose = onClose ?? onConfirm;

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="beneficiary-conflict-title"
            className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/45 p-4"
            onClick={handleClose}
        >
            <div
                className="relative flex w-full max-w-[400px] flex-col gap-5 rounded-2xl bg-white px-5 py-5 shadow-[0_10px_32px_rgba(0,0,0,0.18)] sm:px-7"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="flex justify-end">
                    <ModalCloseButton
                        onClick={handleClose}
                        ariaLabel="Cerrar"
                    />
                </div>

                <h2
                    id="beneficiary-conflict-title"
                    className="text-base font-bold leading-snug text-[#121212]"
                >
                    {message}
                </h2>

                <div className="flex justify-end">
                    <SmallButton
                        text="Confirmar"
                        onClick={onConfirm ?? handleClose}
                        hasAdjustableWidth
                        className="sm:w-[146px]"
                    />
                </div>
            </div>
        </div>
    );
};

export default BeneficiaryConflictModal;
