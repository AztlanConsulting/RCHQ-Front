const DISPLAY_OFFSET_MS = 6 * 60 * 60 * 1000;

const getStartHour = (timestamp) => {
    if (timestamp == null) return "";
    const base =
        timestamp instanceof Date
            ? new Date(timestamp.getTime())
            : new Date(timestamp);
    if (Number.isNaN(base.getTime())) return "";
    const shifted = new Date(base.getTime() + DISPLAY_OFFSET_MS);
    const h = shifted.getHours();
    const m = shifted.getMinutes();
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

const DayGridCard = ({ arg }) => {
    const start = arg.event.start;
    const timeLabel = start != null ? getStartHour(start) : "";
    const showDayLabel = arg.event.allDay || timeLabel === "00:00";

    return (
        <div
            className="fc-dayGridCard"
            style={{
                backgroundColor: arg.event.backgroundColor,
                borderColor: arg.event.borderColor ?? arg.event.backgroundColor,
            }}
        >
            <span className="font-medium truncate block">
                {arg.event.title}
            </span>
            {timeLabel ? (
                <span className="fc-card  font-medium opacity-90 shrink-0 ml-1">
                    {showDayLabel ? "Día" : timeLabel}
                </span>
            ) : null}
        </div>
    );
};

export default DayGridCard;
