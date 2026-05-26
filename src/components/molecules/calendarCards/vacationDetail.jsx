import Button from "../../atoms/button";
import Type from "../../atoms/type";
import {
    formatEventDate,
    formatEventTime,
} from "../../../utils/calendarEventDetail";
import { isPastDate } from "../../../utils/dates";
import VacationEditForm from "../../organism/evento/forms/vacationEditForm";
import MexicoReferenceNotice from "./mexicoReferenceNotice";

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
    showMexicoReferenceNotice = false,
    calendarTimeZone,
}) => {
    const isPast = isPastDate(event.start);
    const status = Number(event.status);

    const isPending = status === 0;
    const isApproved = status === 1;
    const isRejected = status === 2;

    const canDelete = Boolean(onDelete) && (!isApproved || !isPast);
    const canEdit = Boolean(onEdit) && !isPast && !isRejected;
    const canReview = Boolean(onApprove && onReject) && !isPast && isPending;

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

            <MexicoReferenceNotice show={showMexicoReferenceNotice} />

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

                {showMexicoReferenceNotice ? (
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
                ) : null}

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
                        {formatEventDate(
                            event.readableEnd || event.endDate || event.end,
                        )}
                    </Type>
                </div>

                {showMexicoReferenceNotice ? (
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
                ) : null}

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
                        Días hábiles{mexicoDaysSuffix}:
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
