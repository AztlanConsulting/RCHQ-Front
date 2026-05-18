import { getStartHour } from "@/utils/dates";

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
      <span className="font-medium truncate block">{arg.event.title}</span>
      {timeLabel ? (
        <span className="fc-card  font-medium opacity-90 shrink-0 ml-1">
          {showDayLabel ? "Día" : timeLabel}
        </span>
      ) : null}
    </div>
  );
};

export default DayGridCard;
