import { useState, useEffect } from "react";
import Button from "../atoms/button";
import ErrorText from "../atoms/errorText";
import {
    VACATION_REJECTION_FEEDBACK_MAX_LENGTH,
    getVacationRejectionFeedbackErrors,
} from "../../utils/schema/vacation/vacation.schema";

const ConfirmRejectVacationModal = ({
    request,
    loading = false,
    error = "",
    onCancel,
    onConfirm,
}) => {
    const [feedback, setFeedback] = useState("");
    const [fieldError, setFieldError] = useState("");

    useEffect(() => {
        if (request) {
            setFeedback("");
            setFieldError("");
        }
    }, [request]);

    if (!request) return null;

    const employee = request.employee || {};
    const employeeName = employee.fullName || "este empleado";
    const curp = employee.curp;

    const handleFeedbackChange = (event) => {
        const value = event.target.value;

        setFeedback(value);

        if (fieldError) {
            setFieldError("");
        }
    };

    const handleConfirm = () => {
        const validation = getVacationRejectionFeedbackErrors({ feedback });

        if (!validation.success) {
            setFieldError(validation.errors.feedback || "Retroalimentación inválida");
            return;
        }

        onConfirm?.(validation.data.feedback);
    };

    return (
        <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/50 p-4">
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="confirm-reject-vacation-title"
                className="relative flex w-full max-w-[560px] flex-col gap-4 rounded-xl bg-white p-6 shadow-xl"
            >
                <h3
                    id="confirm-reject-vacation-title"
                    className="text-2xl font-bold text-[#121212]"
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
                </div>

                <div>
                    <label
                        htmlFor="vacation-rejection-feedback"
                        className="mb-1.5 block text-sm font-bold text-[#121212]"
                    >
                        Motivo del rechazo (opcional)
                    </label>

                    <textarea
                        id="vacation-rejection-feedback"
                        value={feedback}
                        onChange={handleFeedbackChange}
                        rows={4}
                        maxLength={VACATION_REJECTION_FEEDBACK_MAX_LENGTH}
                        placeholder="Escribe el motivo del rechazo"
                        disabled={loading}
                        className="min-h-[110px] w-full resize-none rounded-lg border border-slate-200 bg-neutral-50 px-4 py-3 text-sm font-medium text-[#222] shadow-[inset_0px_4px_4px_#00000020] outline-none focus:border-slate-400 disabled:cursor-not-allowed disabled:opacity-70"
                    />

                    <div className="mt-1 text-right text-xs font-medium text-slate-500">
                        {`${feedback.length}/${VACATION_REJECTION_FEEDBACK_MAX_LENGTH}`}
                    </div>

                    {fieldError ? <ErrorText>{fieldError}</ErrorText> : null}
                </div>

                {error ? (
                    <span className="block rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
                        {error}
                    </span>
                ) : null}

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
                        text={loading ? "Rechazando..." : "Rechazar"}
                        onClick={handleConfirm}
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

export default ConfirmRejectVacationModal;
