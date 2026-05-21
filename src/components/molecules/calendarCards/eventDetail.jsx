import Button from "../../atoms/button";
import Type from "../../atoms/type";
import Dates from "@/utils/dates";

const EventDetail = ({ event, onEdit, onDelete }) => {
    if (!event) return null;

    const dayText = Dates.formatEventDateRange(
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
                            {Dates.formatEventTime(event.start ?? event.startStr)}
                        </p>
                    </div>
                    <div className="w-full flex items-center justify-between gap-4 mb-4">
                        <Type variant="metric-label" className="font-bold">
                            Fin:
                        </Type>
                        <p className="text-sm">
                            {Dates.formatEventTime(event.end ?? event.endStr)}
                        </p>
                    </div>
                </>
            ) : null}

            {event.description ? (
                <Type variant="body" className="mb-4 block whitespace-pre-wrap">
                    {event.description}
                </Type>
            ) : null}

            {event.peopleInsideEvent &&
            Array.isArray(event.peopleInsideEvent) &&
            event.peopleInsideEvent.length > 0 ? (
                <div className="mb-4">
                    {event.peopleInsideEvent.map((person, idx) => (
                        <p key={`${person?.id}-${idx}`} className="text-sm">
                            {person?.name} - {person?.id}
                        </p>
                    ))}
                </div>
            ) : null}

            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-8">
                <Button
                    type="button"
                    text="Eliminar"
                    width="w-full sm:w-[7.2rem]"
                    height="h-8"
                    textSize="text-[0.95rem]"
                    bgColor="bg-[#A20000]"
                    textColor="text-white"
                    hoverColor="hover:bg-[#870000]"
                    activeColor="active:bg-[#6B0000]"
                    className="rounded-md shadow-[0_4px_10px_rgba(166,0,0,0.32)]"
                    onClick={onDelete}
                />
                <Button
                    type="button"
                    text="Editar"
                    width="w-full sm:w-[7.2rem]"
                    height="h-8"
                    textSize="text-[0.95rem]"
                    bgColor="bg-[#1F3664]"
                    textColor="text-white"
                    hoverColor="hover:bg-[#15284A]"
                    activeColor="active:bg-[#0E1B33]"
                    className="rounded-md shadow-[0_4px_10px_rgba(31,54,100,0.28)]"
                    onClick={onEdit}
                />
            </div>
        </div>
    );
};

export default EventDetail;
