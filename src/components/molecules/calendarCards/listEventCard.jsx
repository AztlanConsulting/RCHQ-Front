const getAbsenceDayMeta = (event) => {
    const currentDay = event.extendedProps?.currentDayIndex;
    const totalDays = event.extendedProps?.totalDays;

    if (!currentDay || !totalDays || totalDays <= 1) return "";
    return `(Día ${currentDay}/${totalDays})`;
};

const ListEventCard = ({ arg }) => {
    const event = arg.event;
    const isAbsence = event.extendedProps?.focus === "ausencias";
    const title = isAbsence
        ? `${event.extendedProps?.employeeName ?? event.title} ${getAbsenceDayMeta(event)}`.trim()
        : event.title;

    return (
        <div className="fc-list-event-card flex items-center gap-3 min-w-0">
            <span
                className="inline-block h-3 w-3 shrink-0 rounded-full"
                style={{
                    backgroundColor: event.borderColor ?? event.backgroundColor,
                }}
                aria-hidden
            />
            <span className="truncate text-base font-semibold text-slate-900">
                {title}
            </span>
        </div>
    );
};

export default ListEventCard;
