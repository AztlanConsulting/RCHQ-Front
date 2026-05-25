import Button from "../atoms/button";

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
                        text={loading ? "Aprobando..." : "Aprobar"}
                        onClick={onConfirm}
                        disabled={loading}
                        width="w-auto"
                        height="h-[38px]"
                        textSize="text-sm"
                        fontWeight="font-bold"
                        bgColor="bg-[#1F3664]"
                        textColor="text-white"
                        hoverColor="hover:bg-[#15284A]"
                        activeColor="active:bg-[#0E1B33]"
                        className="px-5 shadow-md"
                    />
                </div>
            </div>
        </div>
    );
};

export default ConfirmApproveVacationModal;
