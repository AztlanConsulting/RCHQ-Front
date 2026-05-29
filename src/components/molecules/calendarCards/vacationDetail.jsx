import SmallButton from "../../atoms/smallButton";
import Type from "../../atoms/type";
import { formatEventDate } from "../../../utils/calendarEventDetail";
import { isPastDate } from "../../../utils/dates";
import VacationEditForm from "../../organism/evento/forms/vacationEditForm";
import { getStoredUser } from "../../../utils/authStorage";

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
    const user = getStoredUser()
    const role = user?.role || null;
    const userId = user?.employeeId || null;
    const subjectId = event.employeeId || null;

    const isPast = isPastDate(event.start);
    const status = Number(event.status);

    const isPending = status === 0;
    const isApproved = status === 1;
    const isRejected = status === 2;

    const canDelete = Boolean(onDelete) && role == "Coordinador" && (!isApproved || !isPast);
    const canEdit = Boolean(onEdit) && (role == "Coordinador" || userId === subjectId ) && !isPast && !isRejected;
    const canReview = Boolean(onApprove && onReject) && role == "Coordinador" && !isPast && isPending;

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
            />
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
                    <Type
                        variant="body"
                        className="text-[1.05rem] leading-snug"
                    >
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
                    <Type
                        variant="body"
                        className="text-[1.05rem] leading-snug"
                    >
                        {formatEventDate(
                            event.readableStart ||
                                event.startDate ||
                                event.start,
                        )}
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
                        {formatEventDate(
                            event.readableEnd || event.endDate || event.end,
                        )}
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
                    <Type
                        variant="body"
                        className="text-[1.05rem] leading-snug"
                    >
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
                    <Type
                        variant="body"
                        className="text-[1.05rem] leading-snug"
                    >
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
                        <Type
                            variant="body"
                            className="text-[1.05rem] leading-snug"
                        >
                            {feedback}
                        </Type>
                    </div>
                ) : null}
            </div>

            {canReview ? (
                <div>
                    <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-8">
                        <SmallButton
                            type="button"
                            text="Aprobar"
                            hasAdjustableWidth
                            className="h-8 rounded-md sm:w-[7.2rem]"
                            onClick={onApprove}
                        />
                        <SmallButton
                            type="button"
                            text="Rechazar"
                            hasAdjustableWidth
                            className="h-8 rounded-md sm:w-[7.2rem]"
                            onClick={onReject}
                        />
                    </div>
                </div>
            ) : null}

            {canDelete || canEdit ? (
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
            ) : null}
        </div>
    );
};

export default VacationDetail;
