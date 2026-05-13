import Button from "../../atoms/button";
import Type from "../../atoms/type";
import { formatEventDate } from "../../../utils/calendarEventDetail";

const ReadOnlyField = ({ label, value, fullWidth = false }) => (
  <div className={fullWidth ? "col-span-2" : ""}>
    <Type variant="metric-label" className="mb-1.5 font-bold text-[#121212] block">
      {label}
    </Type>
    <div className="min-h-[48px] w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm">
      {value || "—"}
    </div>
  </div>
);

const AbsenceDetail = ({
  event,
  isEditing = false,
  evidenceLabel = "Ver evidencia",
  onOpenEvidence,
  onStartEdit,
  onCancelEdit,
}) => {
  if (!event) return null;

  if (isEditing) {
    return (
      <div className="px-2 sm:px-3 text-left">
        <Type variant="page-title" className="mb-3" as="h2">
          Ausencia
        </Type>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ReadOnlyField label="Nombre del trabajador" value={event.employeeName} />
          <ReadOnlyField label="CURP" value={event.curp} />
          <ReadOnlyField label="Tipo de ausencia" value={event.eventType} fullWidth />
          <ReadOnlyField label="Fecha de inicio" value={formatEventDate(event.startDate)} />
          <ReadOnlyField label="Fecha de fin" value={formatEventDate(event.endDate)} />
          <ReadOnlyField label="Descripción" value={event.description} fullWidth />
        </div>

        <div className="mt-4 flex items-center gap-3">
          <Type variant="metric-label" className="font-bold text-[#121212]">
            Evidencia:
          </Type>
          <Button
            type="button"
            text={event.link ? "Cambiar evidencia" : "Subir evidencia"}
            width="w-auto"
            height="h-10"
            textSize="text-sm"
            bgColor="bg-[#1F3664]"
            textColor="text-white"
            hoverColor="hover:bg-[#15284A]"
            activeColor="active:bg-[#0E1B33]"
            disabled
          />
        </div>

        <div className="mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:gap-4">
          <Button
            type="button"
            text="Modificar"
            width="w-full"
            height="h-11"
            textSize="text-base"
            disabled
          />
          <Button
            type="button"
            text="Cancelar"
            width="w-full"
            height="h-11"
            textSize="text-base"
            bgColor="bg-[#1F3664]"
            textColor="text-white"
            hoverColor="hover:bg-[#15284A]"
            activeColor="active:bg-[#0E1B33]"
            onClick={onCancelEdit}
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
              Fecha de inicio:
            </Type>
            <Type variant="body" className="text-[1.05rem] leading-snug">
              {formatEventDate(event.startDate)}
            </Type>
          </div>
          <div>
            <Type variant="metric-label" className="mb-1 block text-[0.9rem] font-bold text-[#121212]">
              Fecha de fin:
            </Type>
            <Type variant="body" className="text-[1.05rem] leading-snug">
              {formatEventDate(event.endDate)}
            </Type>
          </div>

          <div className="sm:col-span-2">
            <Type variant="metric-label" className="mb-1 block text-[0.9rem] font-bold text-[#121212]">
              Tipo de ausencia:
            </Type>
            <Type variant="body" className="text-[1.05rem] leading-snug">
              {event.eventType || "—"}
            </Type>
          </div>

          <div className="sm:col-span-2">
            <Type variant="metric-label" className="mb-1 block text-[0.9rem] font-bold text-[#121212]">
              Descripción:
            </Type>
            <Type variant="body" className="whitespace-pre-wrap text-[1.05rem] leading-snug">
              {event.description || "—"}
            </Type>
          </div>

          <div className="sm:col-span-2">
            <Type variant="metric-label" className="mb-1 block text-[0.9rem] font-bold text-[#121212]">
              Días hábiles:
            </Type>
            <Type variant="body" className="text-[1.05rem] leading-snug">
              {event.usedDays ?? "—"}
            </Type>
          </div>
        </div>

      <div className="mt-7 flex flex-wrap items-center gap-3">
        <Type variant="metric-label" className="text-[0.9rem] font-bold text-[#121212]">
          Evidencia:
        </Type>
        <Button
          type="button"
          text={evidenceLabel}
          width="w-auto"
          height="h-9"
          textSize="text-xs"
          bgColor="bg-[#1F3664]"
          textColor="text-white"
          hoverColor="hover:bg-[#15284A]"
          activeColor="active:bg-[#0E1B33]"
          onClick={onOpenEvidence}
          disabled={!event.link}
        />
      </div>

      <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center sm:gap-6">
        <Button
          type="button"
          text="Eliminar"
          width="w-full sm:w-40"
          height="h-10"
          textSize="text-base"
          bgColor="bg-[#C20000]"
          textColor="text-white"
          hoverColor="hover:bg-[#930000]"
          activeColor="active:bg-[#7C0000]"
          disabled
        />
        <Button
          type="button"
          text="Editar"
          width="w-full sm:w-40"
          height="h-10"
          textSize="text-base"
          bgColor="bg-[#1F3664]"
          textColor="text-white"
          hoverColor="hover:bg-[#15284A]"
          activeColor="active:bg-[#0E1B33]"
          onClick={onStartEdit}
        />
      </div>
    </div>
  );
};

export default AbsenceDetail;
