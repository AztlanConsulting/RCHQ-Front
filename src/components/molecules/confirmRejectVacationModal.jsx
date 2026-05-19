import Button from "../atoms/button";

const ConfirmRejectVacationModal = ({
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="confirm-reject-vacation-title"
                className="relative flex w-full max-w-sm flex-col gap-4 rounded-2xl bg-white p-8 shadow-xl"
            >
                <h3
                    id="confirm-reject-vacation-title"
                    className="text-lg font-semibold text-slate-900"
                >
                    Rechazar solicitud
                </h3>

                <div className="text-sm text-slate-500">
                    Está a punto de rechazar la solicitud de vacaciones de{" "}
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

                <div className="flex justify-end gap-3">
                    <Button
                        text="Cancelar"
                        onClick={onCancel}
                        disabled={loading}
                        bgColor="bg-transparent"
                        hoverColor="hover:bg-slate-100"
                        activeColor="active:bg-slate-200"
                        textColor="text-slate-600"
                        width="w-auto"
                        height="h-[42px]"
                        textSize="text-sm"
                        fontWeight="font-medium"
                        className="px-4"
                    />

                    <Button
                        text={loading ? "Rechazando..." : "Rechazar"}
                        onClick={onConfirm}
                        disabled={loading}
                        bgColor="bg-[#A20000]"
                        hoverColor="hover:bg-[#870000]"
                        activeColor="active:bg-[#6B0000]"
                        textColor="text-white"
                        width="w-auto"
                        height="h-[42px]"
                        textSize="text-sm"
                        fontWeight="font-semibold"
                        className="px-4"
                    />
                </div>
            </div>
        </div>
    );
};

export default ConfirmRejectVacationModal;
