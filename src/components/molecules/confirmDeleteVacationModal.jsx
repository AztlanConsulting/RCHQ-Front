import SmallButton from "../atoms/smallButton";

const ConfirmDeleteVacationModal = ({
    event,
    loading = false,
    error = "",
    showEmployeeInfo = true,
    onCancel,
    onConfirm,
}) => {
    if (!event) return null;

    const employeeName = event.employeeName || "este empleado";
    const curp = event.curp;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="confirm-delete-vacation-title"
                className="relative flex w-full max-w-sm flex-col gap-4 rounded-xl bg-white p-6 shadow-xl"
            >
                <h3
                    id="confirm-delete-vacation-title"
                    className="text-2xl font-bold text-[#121212]"
                >
                    Eliminar vacaciones
                </h3>

                <div className="text-sm text-slate-500">
                    {showEmployeeInfo ? (
                        <>
                            Está a punto de eliminar la solicitud de vacaciones de{" "}
                            <span className="font-semibold text-slate-700">
                                {employeeName}
                            </span>
                            {curp ? ` - ${curp}` : ""}. Esta acción no se puede deshacer.
                        </>
                    ) : (
                        "Está a punto de eliminar la solicitud de vacaciones. Esta acción no se puede deshacer."
                    )}

                    {error ? (
                        <span className="mt-3 block rounded-md bg-red-50 px-3 py-2 text-red-600">
                            {error}
                        </span>
                    ) : null}
                </div>

                <div className="flex justify-center gap-3 pt-1">
                    <SmallButton
                        text="Cancelar"
                        onClick={onCancel}
                        disabled={loading}
                        cancel
                    />

                    <SmallButton
                        text={loading ? "Eliminando..." : "Eliminar"}
                        onClick={onConfirm}
                        disabled={loading}
                        hasNoRollback
                    />
                </div>
            </div>
        </div>
    );
};

export default ConfirmDeleteVacationModal;
