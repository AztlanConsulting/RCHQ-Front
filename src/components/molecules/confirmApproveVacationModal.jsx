import SmallButton from "../atoms/smallButton";

const ConfirmApproveVacationModal = ({
    request,
    loading = false,
    error = "",
    onCancel,
    onConfirm,
}) => {
    if (!request) return null;

    const employee = request.employee || {};
    const employeeName = employee.fullName || "este empleado";
    const curp = employee.curp;

    return (
        <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/50 p-4">
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="confirm-approve-vacation-title"
                className="relative flex w-full max-w-sm flex-col gap-4 rounded-xl bg-white p-6 shadow-xl"
            >
                <h3
                    id="confirm-approve-vacation-title"
                    className="text-2xl font-bold text-[#121212]"
                >
                    Aprobar solicitud
                </h3>

                <div className="text-sm text-slate-500">
                    Está a punto de aprobar la solicitud de vacaciones de{" "}
                    <span className="font-semibold text-slate-700">
                        {employeeName}
                    </span>
                    {curp ? ` - ${curp}` : ""}. Esta acción moverá la solicitud a
                    revisadas.

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
                        text={loading ? "Aprobando..." : "Aprobar"}
                        onClick={onConfirm}
                        disabled={loading}
                    />
                </div>
            </div>
        </div>
    );
};

export default ConfirmApproveVacationModal;
