
import { getStartHour } from "../../../utils/dates";

const DayGridCard = ({ arg }) => {
    const isMultiDay = Boolean(arg.event.extendedProps?.multiDay);
    const start = arg.event.start;
    const end = arg.event.end;
    const startTimeLabel = start != null ? getStartHour(start) : "";
    const endTimeLabel = end != null ? getStartHour(end) : "";
    const showDayLabel = !isMultiDay && (arg.event.allDay || startTimeLabel === "00:00");
    
    let displayLabel = "";
    if (showDayLabel) {
        displayLabel = "Día";
    } else if (isMultiDay && startTimeLabel && endTimeLabel) {
        displayLabel = `${startTimeLabel} - ${endTimeLabel}`;
    } else if (startTimeLabel) {
        displayLabel = startTimeLabel;
    }

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
            {displayLabel ? (
                <span className="fc-card  font-medium opacity-90 shrink-0 ml-1">
                    {displayLabel}
                </span>
            ) : null}
        </div>
    );
};

export default DayGridCard;
