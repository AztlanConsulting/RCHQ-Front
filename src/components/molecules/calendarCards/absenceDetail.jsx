import SmallButton from "../../atoms/smallButton";
import DateField from "../../atoms/dateField";
import SelectField from "../../atoms/selectField";
import Type from "../../atoms/type";
import ConfirmDeleteModal from "../confirmDeleteModal";
import DocumentFileField from "../documentFileField";
import { formatEventDate, formatEventTime } from "../../../utils/calendarEventDetail";
import { getDocumentFileNameFromLink } from "../../../utils/documentCard.utils";
import MexicoReferenceNotice from "./mexicoReferenceNotice";
import documentIcon from "/document.svg";

const DocumentWhiteIcon = () => (
  <img
    src={documentIcon}
    alt=""
    aria-hidden="true"
    className="mr-1.5 h-4.5 w-4.5 shrink-0 brightness-0 invert"
  />
);

const ReadOnlyField = ({ label, value, fullWidth = false }) => (
  <div className={fullWidth ? "col-span-2" : ""}>
    <Type variant="metric-label" className="mb-1.5 font-bold text-[#121212] block">
      {label}
    </Type>
    <div className="min-h-[48px] w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm">
      {value || "-"}
    </div>
  </div>
);
const TruncatedReadOnlyText = ({ value, lines = 10 }) => {
  const displayValue = value || "—";
  const shouldTruncate = displayValue.length > 200;
  const previewValue = shouldTruncate
    ? `${displayValue.slice(0, 200).trimEnd()}...`
    : displayValue;

  return (
    <div title={shouldTruncate ? displayValue : undefined}>
      <div
        className={`max-w-full whitespace-pre-wrap text-[1.05rem] leading-snug ${
          shouldTruncate ? "overflow-hidden text-ellipsis" : ""
        }`}
        style={{
          display: shouldTruncate ? "-webkit-box" : "block",
          WebkitBoxOrient: shouldTruncate ? "vertical" : undefined,
          WebkitLineClamp: shouldTruncate ? lines : undefined,
          overflow: shouldTruncate ? "hidden" : "visible",
          textOverflow: shouldTruncate ? "ellipsis" : "clip",
          wordBreak: "break-word",
        }}
      >
        <Type variant="body" className="whitespace-pre-wrap text-[1.05rem] leading-snug">
          {previewValue}
        </Type>
      </div>
    </div>
  );
};

const EditableTextArea = ({ label, value, onChange }) => (
  <div className="sm:col-span-2">
    <Type variant="metric-label" className="mb-1.5 block font-bold text-[#121212]">
      {label}
    </Type>
    <textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      rows={4}
      maxLength={200}
      placeholder="Describe la ausencia"
      className="min-h-[110px] w-full resize-none rounded-lg border border-slate-200 bg-neutral-50 px-4 py-3 text-sm font-medium text-[#222] shadow-[inset_0px_4px_4px_#00000020] outline-none focus:border-slate-400"
    />
    <div className="mt-1 text-right text-xs font-medium text-slate-500">
      {`${String(value ?? "").length}/200`}
    </div>
  </div>
);

const AbsenceDetail = ({
  event,
  isEditing = false,
  evidenceLabel = "Ver evidencia",
  absenceTypeOptions = [],
  absenceForm,
  absenceEditError = "",
  absenceDeleteError = "",
  absenceEvidenceFileName = "",
  absenceEvidenceError = "",
  absenceMinStartDate,
  absenceMaxEndDate,
  isSaving = false,
  isDeleteOpen = false,
  isLoadingWhileDeleting = false,
  canManageAbsence = true,
  onOpenEvidence,
  onStartEdit,
  onCancelEdit,
  onSubmitEdit,
  onOpenDelete,
  onCancelDelete,
  onConfirmDelete,
  onAbsenceFieldChange,
  onAbsenceEvidenceChange,
  showMexicoReferenceNotice = false,
  calendarTimeZone,
}) => {
  if (!event) return null;

  const canModifyAbsence = canManageAbsence && !event.isDeleted;
  const hasEvidence = Boolean(event.link);
  const mexicoDaysSuffix = showMexicoReferenceNotice
    ? " (horario cdmx)"
    : "";
  const fileName = hasEvidence
    ? getDocumentFileNameFromLink(event.link)
    : "";
  const displayedFileName =
    absenceEvidenceFileName || fileName;
  const evidencePlaceholder = hasEvidence
    ? "Selecciona un nuevo archivo para reemplazar la evidencia"
    : "Selecciona un archivo de evidencia";
  const selectedStartDate = absenceForm?.startDate
    ? new Date(`${absenceForm.startDate}T00:00:00`)
    : null;
  const absenceEndMinDate =
    selectedStartDate && absenceMinStartDate && selectedStartDate < absenceMinStartDate
      ? absenceMinStartDate
      : selectedStartDate ?? absenceMinStartDate;

  if (isEditing) {
    return (
      <div className="px-2 text-left sm:px-3">
        <Type variant="page-title" className="mb-5 text-[2rem] leading-none" as="h2">
          Ausencia
        </Type>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ReadOnlyField label="Nombre del trabajador" value={event.employeeName} />
          <ReadOnlyField label="CURP" value={event.curp} />
          <div className="sm:col-span-2">
            <SelectField
              label="Tipo de ausencia"
              id="absenceTypeId"
              value={absenceForm?.absenceTypeId ?? ""}
              onChange={(editEvent) =>
                onAbsenceFieldChange?.("absenceTypeId", editEvent.target.value)
              }
              options={absenceTypeOptions.map((option) => ({
                value: option.value,
                label: option.label,
              }))}
              placeholder="Selecciona un tipo"
              labelColor="text-[#121212]"
            />
          </div>
          <DateField
            label="Fecha de inicio"
            name="startDate"
            value={absenceForm?.startDate ?? ""}
            onChange={(editEvent) =>
              onAbsenceFieldChange?.("startDate", editEvent.target.value)
            }
            minDate={absenceMinStartDate}
            maxDate={absenceMaxEndDate}
            labelColor="text-[#121212]"
            popupAlign="left"
            popupSize="compact"
          />
          <DateField
            label="Fecha de fin"
            name="endDate"
            value={absenceForm?.endDate ?? ""}
            onChange={(editEvent) =>
              onAbsenceFieldChange?.("endDate", editEvent.target.value)
            }
            minDate={absenceEndMinDate}
            maxDate={absenceMaxEndDate}
            labelColor="text-[#121212]"
            popupAlign="right"
            popupSize="compact"
          />
          <EditableTextArea
            label="Descripción"
            value={absenceForm?.description ?? ""}
            onChange={(value) => onAbsenceFieldChange?.("description", value)}
          />
        </div>

        <div className="sm:col-span-2">
          <DocumentFileField
            id="absence-evidence-file"
            label="Evidencia"
            labelColor="text-[#121212]"
            fileName={displayedFileName}
            handleFileChange={onAbsenceEvidenceChange}
            placeholder={evidencePlaceholder}
          />
        </div>

        {absenceEditError || absenceEvidenceError ? (
          <p className="mt-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">
            {absenceEditError || absenceEvidenceError}
          </p>
        ) : null}

        <div className="mt-8 flex justify-center gap-3">
          <SmallButton
            type="button"
            text="Cancelar"
            onClick={onCancelEdit}
            disabled={isSaving}
            cancel
          />
          <SmallButton
            type="button"
            text="Guardar"
            onClick={onSubmitEdit}
            disabled={isSaving}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="px-1 text-left sm:px-2">
      <Type variant="page-title" className="mb-5 text-[2rem] leading-none" as="h2">
        Ausencia
      </Type>
      <MexicoReferenceNotice show={showMexicoReferenceNotice} />
      <div className="grid grid-cols-1 gap-x-10 gap-y-7 sm:grid-cols-2">
        <div>
          <Type variant="metric-label" className="mb-1 block text-[0.9rem] font-bold text-[#121212]">
            Nombre del trabajador
          </Type>
          <Type variant="body" className="text-[1.05rem] leading-snug">
            {event.employeeName || "—"}
          </Type>
        </div>
        <div>
          <Type variant="metric-label" className="mb-1 block text-[0.9rem] font-bold text-[#121212]">
            CURP
          </Type>
          <Type variant="body" className="break-all text-[1.05rem] leading-snug sm:break-normal">
            {event.curp || "—"}
          </Type>
        </div>
        <div>
          <Type variant="metric-label" className="mb-1 block text-[0.9rem] font-bold text-[#121212]">
            Tipo de ausencia:
          </Type>
          <Type variant="body" className="text-[1.05rem] leading-snug">
            {event.eventType || "—"}
          </Type>
        </div>
        <div>
          <Type variant="metric-label" className="mb-1 block text-[0.9rem] font-bold text-[#121212]">
            Días totales{mexicoDaysSuffix}:
          </Type>
          <Type variant="body" className="text-[1.05rem] leading-snug">
            {event.totalDays ?? "—"}
          </Type>
        </div>
        <div>
          <Type variant="metric-label" className="mb-1 block text-[0.9rem] font-bold text-[#121212]">
            Días hábiles{mexicoDaysSuffix}:
          </Type>
          <Type variant="body" className="text-[1.05rem] leading-snug">
            {event.usedDays ?? "—"}
          </Type>
        </div>
        <div>
          <Type variant="metric-label" className="mb-1 block text-[0.9rem] font-bold text-[#121212]">
            Fecha de inicio:
          </Type>
          <Type variant="body" className="text-[1.05rem] leading-snug">
            {formatEventDate(
              event.readableStart ?? event.startDate ?? event.start,
            )}
          </Type>
        </div>
        {showMexicoReferenceNotice ? (
          <>
            <div>
              <Type variant="metric-label" className="mb-1 block text-[0.9rem] font-bold text-[#121212]">
                Hora de inicio:
              </Type>
              <Type variant="body" className="text-[1.05rem] leading-snug">
                {formatEventTime(event.start, { timeZone: calendarTimeZone })}
              </Type>
            </div>
            <div>
              <Type variant="metric-label" className="mb-1 block text-[0.9rem] font-bold text-[#121212]">
                Fecha de término:
              </Type>
              <Type variant="body" className="text-[1.05rem] leading-snug">
                {formatEventDate(event.readableEnd ?? event.endDate ?? event.end)}
              </Type>
            </div>
            <div>
              <Type variant="metric-label" className="mb-1 block text-[0.9rem] font-bold text-[#121212]">
                Hora de término:
              </Type>
              <Type variant="body" className="text-[1.05rem] leading-snug">
                {formatEventTime(event.end, {
                  timeZone: calendarTimeZone
                })}
              </Type>
            </div>
          </>
        ) : (
          <div>
            <Type variant="metric-label" className="mb-1 block text-[0.9rem] font-bold text-[#121212]">
              Fecha de término:
            </Type>
            <Type variant="body" className="text-[1.05rem] leading-snug">
              {formatEventDate(event.readableEnd ?? event.endDate ?? event.end)}
            </Type>
          </div>
        )}
        <div className="sm:col-span-2">
          <Type variant="metric-label" className="mb-1 block text-[0.9rem] font-bold text-[#121212]">
            Descripción:
          </Type>
          <TruncatedReadOnlyText value={event.description} />
        </div>
      </div>

      <div
        className={`mt-7 flex flex-wrap gap-2.5 ${
          hasEvidence ? "items-center" : "items-baseline"
        }`}
      >
        <Type
          variant="metric-label"
          className="text-[0.9rem] font-bold text-[#121212]"
        >
          Evidencia:
        </Type>
        {hasEvidence ? (
          <SmallButton
            type="button"
            text={evidenceLabel}
            onClick={onOpenEvidence}
            leadingIcon={<DocumentWhiteIcon />}
            className="h-8 min-w-0 rounded-md px-2.5"
          />
        ) : (
          <Type variant="body" className="text-[1.05rem] leading-snug">
            Sin evidencia
          </Type>
        )}
      </div>

      {canModifyAbsence ? (
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-8">
          <SmallButton
            type="button"
            text="Eliminar"
            hasNoRollback
            hasAdjustableWidth
            className="h-8 rounded-md sm:w-[7.2rem]"
            onClick={onOpenDelete}
          />
          <SmallButton
            type="button"
            text="Editar"
            hasAdjustableWidth
            className="h-8 rounded-md sm:w-[7.2rem]"
            onClick={onStartEdit}
          />
        </div>
      ) : null}

      {isDeleteOpen ? (
        <ConfirmDeleteModal
          label={event.employeeName || "ausencia"}
          mode="delete"
          inline
          loading={isLoadingWhileDeleting}
          title="Eliminar ausencia"
          body={(
            <>
              Está a punto de eliminar la ausencia de{" "}
              <span className="font-semibold text-slate-700">
                {event.employeeName || "este trabajador"}
              </span>
              {event.curp ? ` — ${event.curp}` : ""}. Esta acción no se puede revertir.
              {absenceDeleteError ? (
                <span className="mt-2 block rounded-md bg-red-50 px-3 py-2 text-red-600">
                  {absenceDeleteError}
                </span>
              ) : null}
            </>
          )}
          onCancel={onCancelDelete}
          onConfirm={onConfirmDelete}
        />
      ) : null}
    </div>
  );
};

export default AbsenceDetail;
