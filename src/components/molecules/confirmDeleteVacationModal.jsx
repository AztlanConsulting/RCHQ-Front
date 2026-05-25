import Button from "../atoms/button";

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
                    <Button
                        text="Cancelar"
                        onClick={onCancel}
                        disabled={loading}
                        width="w-auto"
                        height="h-[38px]"
                        textSize="text-sm"
                        fontWeight="font-bold"
                        bgColor="bg-white"
                        textColor="text-[#121212]"
                        hoverColor="hover:bg-slate-50"
                        activeColor="active:bg-slate-100"
                        className="px-5 border border-slate-200 shadow-md"
                    />

                    <Button
                        text={loading ? "Eliminando..." : "Eliminar"}
                        onClick={onConfirm}
                        disabled={loading}
                        width="w-auto"
                        height="h-[38px]"
                        textSize="text-sm"
                        fontWeight="font-bold"
                        bgColor="bg-[#A20000]"
                        textColor="text-white"
                        hoverColor="hover:bg-[#870000]"
                        activeColor="active:bg-[#6B0000]"
                        className="px-5 shadow-md"
                    />
                </div>
            </div>
        </div>
    );
};

export default ConfirmDeleteVacationModal;
