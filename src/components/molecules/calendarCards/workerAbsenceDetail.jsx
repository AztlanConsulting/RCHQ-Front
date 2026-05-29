import SmallButton from "../../atoms/smallButton";
import Type from "../../atoms/type";
import {
  formatEventDate,
  formatEventTime,
} from "../../../utils/calendarEventDetail";
import MexicoReferenceNotice from "./mexicoReferenceNotice";

const DetailLabel = ({ children, className = "" }) => (
  <Type
    variant="metric-label"
    className={`mb-1 block text-[0.9rem] font-bold text-[#121212] ${className}`}
  >
    {children}
  </Type>
);

const MAX_DESCRIPTION_LENGTH = 200;

const DetailValue = ({ children, className = "", ...props }) => (
  <Type
    variant="body"
    className={`block text-[1.05rem] leading-snug text-[#121212] ${className}`}
    {...props}
  >
    {children === null || children === undefined || children === "" ? "-" : children}
  </Type>
);

const getDescriptionPreview = (description = "") => {
  const text = String(description);
  if (text.length <= MAX_DESCRIPTION_LENGTH) return text;
  return `${text.slice(0, MAX_DESCRIPTION_LENGTH).trimEnd()}...`;
};

const EvidenceButtonIcon = () => (
  <img
    src="/document.svg"
    alt=""
    className="mr-1.5 h-4.5 w-4.5 shrink-0 brightness-0 invert"
    aria-hidden
  />
);

const WorkerAbsenceDetail = ({
  event,
  evidenceLabel = "Ver evidencia",
  onOpenEvidence,
  onClose,
  showMexicoReferenceNotice = false,
  calendarTimeZone,
}) => {
  const hasEvidence = Boolean(event?.link);
  const fullDescription = String(event?.description ?? "");
  const descriptionPreview = getDescriptionPreview(fullDescription);
  const mexicoDaysSuffix = showMexicoReferenceNotice
    ? " (horario cdmx)"
    : "";

  return (
    <div className="px-1 text-left sm:px-2">
      <Type
        variant="page-title"
        className="mb-5 text-[2rem] leading-none text-[#121212]"
        as="h2"
      >
        Ausencia
      </Type>

      <MexicoReferenceNotice show={showMexicoReferenceNotice} />

      <div className="grid grid-cols-1 gap-x-10 gap-y-7 sm:grid-cols-2">
        <div>
          <DetailLabel>Tipo de ausencia:</DetailLabel>
          <DetailValue>{event?.eventType}</DetailValue>
        </div>

        <div>
          <DetailLabel>Días totales{mexicoDaysSuffix}:</DetailLabel>
          <DetailValue>{event?.totalDays}</DetailValue>
        </div>

        <div>
          <DetailLabel>Días hábiles{mexicoDaysSuffix}:</DetailLabel>
          <DetailValue>{event?.usedDays}</DetailValue>
        </div>

        <div>
          <DetailLabel>Fecha de inicio:</DetailLabel>
          <DetailValue>{formatEventDate(event?.readableStart)}</DetailValue>
        </div>

        {showMexicoReferenceNotice ? (
          <>
            <div>
              <DetailLabel>Hora de inicio:</DetailLabel>
              <DetailValue>
                {formatEventTime(event?.start, { timeZone: calendarTimeZone })}
              </DetailValue>
            </div>

            <div>
              <DetailLabel>Fecha de término:</DetailLabel>
              <DetailValue>{formatEventDate(event?.readableEnd)}</DetailValue>
            </div>

            <div>
              <DetailLabel>Hora de término:</DetailLabel>
              <DetailValue>
                {formatEventTime(event?.end, {
                  timeZone: calendarTimeZone
                })}
              </DetailValue>
            </div>
          </>
        ) : (
          <div>
            <DetailLabel>Fecha de término:</DetailLabel>
            <DetailValue>{formatEventDate(event?.readableEnd)}</DetailValue>
          </div>
        )}

        <div className="sm:col-span-2">
          <DetailLabel>Descripción:</DetailLabel>
          <DetailValue
            className="max-w-[29rem] whitespace-pre-line"
            title={fullDescription || undefined}
          >
            {descriptionPreview}
          </DetailValue>
        </div>

        <div
          className={`flex flex-wrap gap-3 sm:col-span-2 ${
            hasEvidence ? "items-center" : "items-baseline"
          }`}
        >
          <DetailLabel className="mb-0">Evidencia:</DetailLabel>
          {hasEvidence ? (
            <SmallButton
              type="button"
              text={evidenceLabel}
              onClick={onOpenEvidence}
              leadingIcon={<EvidenceButtonIcon />}
              className="h-7 min-w-[7.25rem] rounded-md px-3"
            />
          ) : (
            <DetailValue>Sin evidencia</DetailValue>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkerAbsenceDetail;
