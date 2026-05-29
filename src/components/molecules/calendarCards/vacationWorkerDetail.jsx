import SmallButton from "../../atoms/smallButton";
import Type from "../../atoms/type";
import {
    formatEventDate,
    formatEventTime,
} from "../../../utils/calendarEventDetail";
import { isPastDate } from "../../../utils/dates";
import VacationEditForm from "../../organism/evento/forms/vacationEditForm";
import MexicoReferenceNotice from "./mexicoReferenceNotice";

const VacationWorkerDetail = ({
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
    showMexicoReferenceNotice = false,
    calendarTimeZone,
}) => {
    const isPast = isPastDate(event.start);
    const status = Number(event.status);
    const isPending = status === 0;
    const isApproved = status === 1;
    const isRejected = status === 2;
    const canDelete = !isApproved || !isPast;
    const canEdit = !isPast && isPending;
    const title =
        isRejected ? "Vacaciones Rechazadas" : "Solicitud de Vacaciones";
    const statusLabel =
        isApproved ? "Aceptado" : (isRejected ? "Rechazado" : "Pendiente");
    const mexicoDaysSuffix = showMexicoReferenceNotice
        ? " (horario cdmx)"
        : "";

    if (isEditing) {
        return (
            <VacationEditForm
                title={title}
                event={event}
                vacationForm={vacationForm}
                vacationEditError={vacationEditError}
                vacationRemainingInfo={vacationRemainingInfo}
                isLoadingVacationRemaining={isLoadingVacationRemaining}
                isSaving={isSaving}
                onCancelEdit={onCancelEdit}
                onSubmitEdit={onSubmitEdit}
                onVacationFieldChange={onVacationFieldChange}
                showEmployeeInfo={false}
            />
        );
    }

    return (
        <div className="px-1 text-left sm:px-2">
            <Type
                variant="page-title"
                className="mb-5 text-[2rem] leading-none"
                as="h2"
            >
                {title}
            </Type>
            <MexicoReferenceNotice show={showMexicoReferenceNotice} />
            <div className="grid grid-cols-1 gap-x-10 gap-y-7 sm:grid-cols-2">
                <div>
                    <Type
                        variant="metric-label"
                        className="mb-1 block text-[0.9rem] font-bold text-[#121212]"
                    >
                        Fecha de inicio:
                    </Type>
                    <Type
                        variant="body"
                        className="text-[1.05rem] leading-snug"
                    >
                        {formatEventDate(event.readableStart) || "—"}
                    </Type>
                </div>
                {showMexicoReferenceNotice ? (
                    <>
                        <div>
                            <Type
                                variant="metric-label"
                                className="mb-1 block text-[0.9rem] font-bold text-[#121212]"
                            >
                                Hora de inicio:
                            </Type>
                            <Type
                                variant="body"
                                className="text-[1.05rem] leading-snug"
                            >
                                {formatEventTime(event.start, {
                                    timeZone: calendarTimeZone,
                                })}
                            </Type>
                        </div>

                        <div>
                            <Type
                                variant="metric-label"
                                className="mb-1 block text-[0.9rem] font-bold text-[#121212]"
                            >
                                Fecha de término:
                            </Type>
                            <Type
                                variant="body"
                                className="text-[1.05rem] leading-snug"
                            >
                                {formatEventDate(event.readableEnd) || "—"}
                            </Type>
                        </div>
                        <div>
                            <Type
                                variant="metric-label"
                                className="mb-1 block text-[0.9rem] font-bold text-[#121212]"
                            >
                                Hora de término:
                            </Type>
                            <Type
                                variant="body"
                                className="text-[1.05rem] leading-snug"
                            >
                                {formatEventTime(event.end, {
                                    timeZone: calendarTimeZone
                                })}
                            </Type>
                        </div>
                    </>
                ) : (
                    <div>
                        <Type
                            variant="metric-label"
                            className="mb-1 block text-[0.9rem] font-bold text-[#121212]"
                        >
                            Fecha de término:
                        </Type>
                        <Type
                            variant="body"
                            className="text-[1.05rem] leading-snug"
                        >
                            {formatEventDate(event.readableEnd) || "—"}
                        </Type>
                    </div>
                )}
                <div>
                    <Type
                        variant="metric-label"
                        className="mb-1 block text-[0.9rem] font-bold text-[#121212]"
                    >
                        Días totales{mexicoDaysSuffix}:
                    </Type>
                    <Type
                        variant="body"
                        className="text-[1.05rem] leading-snug"
                    >
                        {event.totalDays}
                    </Type>
                </div>
                <div>
                    <Type
                        variant="metric-label"
                        className="mb-1 block text-[0.9rem] font-bold text-[#121212]"
                    >
                        Días hábiles{mexicoDaysSuffix}:
                    </Type>
                    <Type
                        variant="body"
                        className="text-[1.05rem] leading-snug"
                    >
                        {event.usedDays}
                    </Type>
                </div>
                <div className="sm:col-span-2">
                    <Type
                        variant="metric-label"
                        className="mb-1 block text-[0.9rem] font-bold text-[#121212]"
                    >
                        Estado:
                    </Type>
                    <Type
                        variant="body"
                        className="text-[1.05rem] leading-snug"
                    >
                        {statusLabel}
                    </Type>
                </div>
                <div className="sm:col-span-2">
                    <Type
                        variant="metric-label"
                        className="mb-1 block text-[0.9rem] font-bold text-[#121212]"
                    >
                        Retroalimentación:
                    </Type>
                    <Type
                        variant="body"
                        className="text-[1.05rem] leading-snug"
                    >
                        {event.feedback || "N/A"}
                    </Type>
                </div>
            </div>

            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-8">
                {canDelete ? (
                    <SmallButton
                        type="button"
                        text="Eliminar"
                        hasNoRollback
                        hasAdjustableWidth
                        className="h-8 rounded-md sm:w-[7.2rem]"
                        onClick={onDelete}
                    />
                ) : null}

                {canEdit ? (
                    <SmallButton
                        type="button"
                        text="Editar"
                        hasAdjustableWidth
                        className="h-8 rounded-md sm:w-[7.2rem]"
                        onClick={onEdit}
                    />
                ) : null}
            </div>
        </div>
    );
};

export default VacationWorkerDetail;
