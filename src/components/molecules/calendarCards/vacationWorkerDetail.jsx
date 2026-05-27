import SmallButton from "../../atoms/smallButton";
import Type from "../../atoms/type";
import { formatEventDate } from "../../../utils/calendarEventDetail";
import { isPastDate } from "../../../utils/dates";
import VacationEditForm from "../../organism/evento/forms/vacationEditForm";

const VacationWorkerDetail = ({
    event,
    isEditing = false,
    vacationForm,
    vacationEditError = "",
    vacationRemainingInfo = null,
    isLoadingVacationRemaining = false,
    isSaving = false,
    onClose,
    onEdit,
    onCancelEdit,
    onSubmitEdit,
    onVacationFieldChange,
    onDelete,
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
                <div>
                    <Type
                        variant="metric-label"
                        className="mb-1 block text-[0.9rem] font-bold text-[#121212]"
                    >
                        Fecha de fin:
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
                        Días totales:
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
                        Días hábiles:
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
                ) : (
                    <SmallButton
                        type="button"
                        text="Cerrar"
                        hasAdjustableWidth
                        className="h-8 rounded-md sm:w-[7.2rem]"
                        onClick={onClose}
                    />
                )}
            </div>
        </div>
    );
};

export default VacationWorkerDetail;
