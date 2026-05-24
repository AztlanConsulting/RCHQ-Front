import Button from "../../atoms/button";
import Type from "../../atoms/type";
import { formatEventDate } from "../../../utils/calendarEventDetail";
import { isPastDate } from "../../../utils/dates";
import DateField from "../../atoms/dateField";

const VacationDetail = ({
    event,
    isEditing = false,
    vacationForm,
    vacationEditError = "",
    vacationRemainingInfo = null,
    isLoadingVacationRemaining = false,
    isSaving = false,
    onEdit,
    onCancelEdit,
    onSubmitEdit,
    onVacationFieldChange,
    onDelete,
    onApprove,
    onReject,
}) => {
    const isPast = isPastDate(event.start);
    const status = Number(event.status);

    const isPending = status === 0;
    const isApproved = status === 1;
    const isRejected = status === 2;

    const canDelete = !isApproved || !isPast;
    const canEdit = !isPast && !isRejected;
    const canReview = !isPast && isPending;

    const title = isPending
        ? "Solicitud de Vacaciones"
        : isRejected
            ? "Vacaciones Rechazadas"
            : "Vacaciones";

    const statusLabel = isApproved
        ? "Aprobadas"
        : isRejected
            ? "Rechazadas"
            : "En espera";

    const feedback = event.feedback || event.vacationFeedback || "";
    const shouldShowFeedback = Boolean(feedback);

    if (isEditing) {
        return (
            <div key="vacation-edit" className="px-2 text-left sm:px-3">
                <Type
                    variant="page-title"
                    className="mb-5 text-[2rem] leading-none"
                    as="h2"
                >
                    {title}
                </Type>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <Type
                            variant="metric-label"
                            className="mb-1.5 block font-bold text-[#121212]"
                        >
                            Nombre del trabajador
                        </Type>
                        <div className="min-h-[48px] w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm">
                            {event.employeeName || "-"}
                        </div>
                    </div>

                    <div>
                        <Type
                            variant="metric-label"
                            className="mb-1.5 block font-bold text-[#121212]"
                        >
                            CURP
                        </Type>
                        <div className="min-h-[48px] w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm">
                            {event.curp || "-"}
                        </div>
                    </div>

                    <div className="sm:col-span-2 rounded-lg bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
                        {isLoadingVacationRemaining ? (
                            "Consultando días disponibles..."
                        ) : vacationRemainingInfo ? (
                            <>
                                <p>
                                    Días disponibles:{" "}
                                    <span className="font-bold">
                                        {vacationRemainingInfo.remainingVacations}
                                    </span>
                                </p>
                                <p className="text-xs text-slate-500">
                                    Periodo actual:{" "}
                                    {String(vacationRemainingInfo.startDate).split("T")[0]} a{" "}
                                    {String(vacationRemainingInfo.endDate).split("T")[0]}
                                </p>
                            </>
                        ) : (
                            "No se pudieron consultar los días disponibles."
                        )}
                    </div>

                    <DateField
                        label="Fecha de inicio"
                        name="startDate"
                        value={vacationForm?.startDate ?? ""}
                        onChange={(editEvent) =>
                            onVacationFieldChange?.(
                                "startDate",
                                editEvent.target.value,
                            )
                        }
                        labelColor="text-[#121212]"
                        popupAlign="left"
                        popupPlacement="top"
                        popupSize="compact"
                    />

                    <DateField
                        label="Fecha de fin"
                        name="endDate"
                        value={vacationForm?.endDate ?? ""}
                        onChange={(editEvent) =>
                            onVacationFieldChange?.(
                                "endDate",
                                editEvent.target.value,
                            )
                        }
                        minDate={
                            vacationForm?.startDate
                                ? new Date(`${vacationForm.startDate}T00:00:00`)
                                : undefined
                        }
                        labelColor="text-[#121212]"
                        popupAlign="right"
                        popupPlacement="top"
                        popupSize="compact"
                    />
                </div>

                {vacationEditError ? (
                    <p className="mt-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">
                        {vacationEditError}
                    </p>
                ) : null}

                <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center sm:gap-5">
                    <Button
                        type="button"
                        text="Cancelar"
                        width="w-full sm:w-[10rem]"
                        height="h-11"
                        textSize="text-base"
                        bgColor="bg-white"
                        textColor="text-[#121212]"
                        hoverColor="hover:bg-slate-50"
                        activeColor="active:bg-slate-100"
                        className="border border-slate-200 shadow-md"
                        onClick={onCancelEdit}
                        disabled={isSaving}
                    />
                    <Button
                        type="button"
                        text="Guardar"
                        width="w-full sm:w-[10rem]"
                        height="h-11"
                        textSize="text-base"
                        bgColor="bg-[#1F3664]"
                        textColor="text-white"
                        hoverColor="hover:bg-[#15284A]"
                        activeColor="active:bg-[#0E1B33]"
                        className="shadow-md"
                        onClick={onSubmitEdit}
                        disabled={isSaving}
                    />
                </div>
            </div>
        );
    }

    return (
        <div key="vacation-detail" className="px-1 text-left sm:px-2">
            <Type
                variant="page-title"
                className="mb-5 text-[2rem] leading-none"
                as="h2"
            >
                {title}
            </Type>

            <div className="grid grid-cols-1 gap-x-10 gap-y-7 sm:grid-cols-2">
                <div>
                    <Type
                        variant="metric-label"
                        className="mb-1 block text-[0.9rem] font-bold text-[#121212]"
                    >
                        Nombre del trabajador
                    </Type>
                    <Type variant="body" className="text-[1.05rem] leading-snug">
                        {event.employeeName || "—"}
                    </Type>
                </div>

                <div>
                    <Type
                        variant="metric-label"
                        className="mb-1 block text-[0.9rem] font-bold text-[#121212]"
                    >
                        CURP
                    </Type>
                    <Type
                        variant="body"
                        className="break-all text-[1.05rem] leading-snug sm:break-normal"
                    >
                        {event.curp || "—"}
                    </Type>
                </div>

                <div>
                    <Type
                        variant="metric-label"
                        className="mb-1 block text-[0.9rem] font-bold text-[#121212]"
                    >
                        Fecha de inicio:
                    </Type>
                    <Type variant="body" className="text-[1.05rem] leading-snug">
                        {formatEventDate(event.readableStart || event.startDate || event.start)}
                    </Type>
                </div>

                <div>
                    <Type
                        variant="metric-label"
                        className="mb-1 block text-[0.9rem] font-bold text-[#121212]"
                    >
                        Fecha de fin:
                    </Type>
                    <Type variant="body" className="text-[1.05rem] leading-snug">
                        {formatEventDate(event.readableEnd || event.endDate || event.end)}
                    </Type>
                </div>

                <div>
                    <Type
                        variant="metric-label"
                        className="mb-1 block text-[0.9rem] font-bold text-[#121212]"
                    >
                        Días totales:
                    </Type>
                    <Type variant="body" className="text-[1.05rem] leading-snug">
                        {event.totalDays === "" || event.totalDays == null
                            ? "-"
                            : event.totalDays}
                    </Type>
                </div>

                <div>
                    <Type
                        variant="metric-label"
                        className="mb-1 block text-[0.9rem] font-bold text-[#121212]"
                    >
                        Días hábiles:
                    </Type>
                    <Type variant="body" className="text-[1.05rem] leading-snug">
                        {event.usedDays === "" || event.usedDays == null
                            ? "-"
                            : event.usedDays}
                    </Type>
                </div>

                <div className="sm:col-span-2">
                    <Type
                        variant="metric-label"
                        className="mb-1 block text-[0.9rem] font-bold text-[#121212]"
                    >
                        Estado:
                    </Type>
                    <Type variant="body" className="text-[1.05rem] leading-snug">
                        {statusLabel}
                    </Type>
                </div>

                {shouldShowFeedback ? (
                    <div className="sm:col-span-2">
                        <Type
                            variant="metric-label"
                            className="mb-1 block text-[0.9rem] font-bold text-[#121212]"
                        >
                            Retroalimentación:
                        </Type>
                        <Type variant="body" className="text-[1.05rem] leading-snug">
                            {feedback}
                        </Type>
                    </div>
                ) : null}
            </div>

            {canDelete || canEdit ? (
                <div className="mt-6 flex flex-row items-center gap-3 sm:justify-center sm:gap-8">
                    {canDelete ? (
                        <Button
                            type="button"
                            text="Eliminar"
                            width={
                                canEdit
                                    ? "w-1/2 sm:w-[7.2rem]"
                                    : "w-full sm:w-[7.2rem]"
                            }
                            height="h-8"
                            textSize="text-[0.95rem]"
                            bgColor="bg-[#A20000]"
                            textColor="text-white"
                            hoverColor="hover:bg-[#870000]"
                            activeColor="active:bg-[#6B0000]"
                            className="rounded-md shadow-[0_4px_10px_rgba(166,0,0,0.32)]"
                            onClick={onDelete}
                        />
                    ) : null}

                    {canEdit ? (
                        <Button
                            type="button"
                            text="Editar"
                            width={
                                canDelete
                                    ? "w-1/2 sm:w-[7.2rem]"
                                    : "w-full sm:w-[7.2rem]"
                            }
                            height="h-8"
                            textSize="text-[0.95rem]"
                            bgColor="bg-[#1F3664]"
                            textColor="text-white"
                            hoverColor="hover:bg-[#15284A]"
                            activeColor="active:bg-[#0E1B33]"
                            className="rounded-md shadow-[0_4px_10px_rgba(31,54,100,0.28)]"
                            onClick={onEdit}
                        />
                    ) : null}
                </div>
            ) : null}

            {canReview ? (
                <div>
                    <div className="mt-4 border border-b border-[#EAEAEA]"></div>

                    <div className="mt-4 flex flex-row items-center gap-3 sm:justify-center sm:gap-8">
                        <Button
                            type="button"
                            text="Aprobar"
                            width="w-1/2 sm:w-[7.2rem]"
                            height="h-8"
                            textSize="text-[0.95rem]"
                            bgColor="bg-[#1F3664]"
                            textColor="text-white"
                            hoverColor="hover:bg-[#15284A]"
                            activeColor="active:bg-[#0E1B33]"
                            className="rounded-md shadow-[0_4px_10px_rgba(31,54,100,0.28)]"
                            onClick={onApprove}
                        />
                        <Button
                            type="button"
                            text="Rechazar"
                            width="w-1/2 sm:w-[7.2rem]"
                            height="h-8"
                            textSize="text-[0.95rem]"
                            bgColor="bg-[#1F3664]"
                            textColor="text-white"
                            hoverColor="hover:bg-[#15284A]"
                            activeColor="active:bg-[#0E1B33]"
                            className="rounded-md shadow-[0_4px_10px_rgba(31,54,100,0.28)]"
                            onClick={onReject}
                        />
                    </div>
                </div>
            ) : null}
        </div>
    );
};

export default VacationDetail;
