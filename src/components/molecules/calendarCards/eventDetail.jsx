import Button from "../../atoms/button";
import Type from "../../atoms/type";
import {
    formatEventDateRange,
    formatEventTime,
} from "../../../utils/calendarEventDetail";

const EventDetail = ({ event }) => {
    if (!event) return null;

    const dayText = formatEventDateRange(
        event.date || event.startDate || event.start || event.startStr,
        event.date || event.endDate || event.end || event.endStr,
        { endExclusive: Boolean(event.allDay) && !event.date },
    );

    return (
        <div className="text-left">
            <Type variant="page-title" className="mb-2" as="h2">
                {event.title ?? "—"}
            </Type>

            <div className="flex items-center gap-2 mb-2">
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
                <Type variant="subtitle" as="span">
                    {event.scopeLabel || event.scope || "—"}
                </Type>
            </div>

            <div className="mb-4">
                <Type variant="subtitle" as="span">
                    {event.focusLabel || event.focus || "—"}
                    {event.eventType ? ` · ${event.eventType}` : ""}
                </Type>
            </div>

            {event.subtitle ? (
                <Type variant="body" className="mb-4 block">
                    {event.subtitle}
                </Type>
            ) : null}

            <div className="w-full flex items-center justify-between gap-4 mb-2">
                <Type variant="metric-label" className="font-bold">
                    Día (calendario):
                </Type>
                <p className="text-sm">{dayText}</p>
            </div>
            {!event.allDay ? (
                <>
                    <div className="w-full flex items-center justify-between gap-4 mb-2">
                        <Type variant="metric-label" className="font-bold">
                            Inicio:
                        </Type>
                        <p className="text-sm">
                            {formatEventTime(event.start ?? event.startStr)}
                        </p>
                    </div>
                    <div className="w-full flex items-center justify-between gap-4 mb-4">
                        <Type variant="metric-label" className="font-bold">
                            Fin:
                        </Type>
                        <p className="text-sm">
                            {formatEventTime(event.end ?? event.endStr)}
                        </p>
                    </div>
                </>
            ) : null}

            {event.description ? (
                <Type variant="body" className="mb-4 block whitespace-pre-wrap">
                    {event.description}
                </Type>
            ) : null}

            {event.peopleInsideEvent
                ? event.peopleInsideEvent.map((person, idx) => (
                      <p key={idx}>
                          {person?.name} - {person?.id}
                      </p>
                  ))
                : null}

            <div className="w-full flex justify-around items-center gap-4 pt-2">
                <Button type="button">Eliminar</Button>
                <Button type="button">Modificar</Button>
            </div>
        </div>
    );
};

export default EventDetail;
