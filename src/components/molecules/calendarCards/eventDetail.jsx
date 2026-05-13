import Button from "../../atoms/button";
import Type from "../../atoms/type";
import {
  formatEventCalendarDate,
  formatEventDateTime,
} from "../../../utils/dates";

const capitalizeFirst = (value) => {
  if (value == null || value === "") return "";
  const s = String(value);
  return s.charAt(0).toUpperCase() + s.slice(1);
};

const EventDetail = ({ event }) => {
  if (!event) return null;

  return (
    <div className="text-left">
      <Type variant="page-title" className="mb-2" as="h2">
        {event.title ?? "—"}
      </Type>

      <div className="flex flex-col mb-4">
        <div className="flex items-center gap-2">
            {event.icon ? (
                <img
                    src={`/${event.icon}.svg`}
                    alt=""
                    className="h-4 w-4 shrink-0 object-contain brightness-0"
                    loading="lazy"
                />
            ) : null}

            <Type variant="subtitle" as="p">
                {event.focusLabel || "--"}
            </Type>
        </div>

        <div className="flex items-center gap-2">
            {event.borderColor && (
                <span
                    className="inline-block size-3 rounded-full shrink-0"
                    style={{
                        backgroundColor:
                            event.borderColor ||
                            event.backgroundColor ||
                            "#ccc",
                    }}
                    aria-hidden
                />
            )}

            <Type variant="subtitle" as="p">
                {`${capitalizeFirst(event.eventType) || "--"}`}
            </Type>
        </div>
    </div>

      {event.subtitle ? (
        <Type variant="body" className="mb-4 block">
          {event.subtitle}
        </Type>
      ) : null}

      <div className="w-full flex items-center justify-between gap-4 mb-3">
        <Type variant="metric-label">
          <span className="text-[1rem] font-bold text-black">Fecha:</span>
        </Type>
        <p className="text-sm">
          {event.date ? formatEventCalendarDate(event.date) : "—"}
        </p>
      </div>
      <div className="w-full flex items-center justify-between gap-4">
        <Type variant="metric-label">
        <span className="text-[1rem] font-bold text-black">Inicio:</span>
        </Type>
        <p className="text-sm">{formatEventDateTime(event.start ?? event.startStr)}</p>
      </div>
      <div className="w-full flex items-center justify-between gap-4 mb-4">
        <Type variant="metric-label">
        <span className="text-[1rem] font-bold text-black">Fin:</span>
        </Type>
        <p className="text-sm">{formatEventDateTime(event.end ?? event.endStr)}</p>
      </div>

      {event.description ? (
        <Type variant="body" className="mb-4 block whitespace-pre-wrap">
          {event.description}
        </Type>
      ) : null}

      <div className="w-full flex justify-around items-center gap-4 pt-2">
        <Button type="button">Eliminar</Button>
        <Button type="button">Modificar</Button>
      </div>
    </div>
  );
};

export default EventDetail;
