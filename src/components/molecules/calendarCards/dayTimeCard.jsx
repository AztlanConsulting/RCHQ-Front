import { getStartHour } from "@/utils/dates";

const DayTimeCard = ({ arg }) => {
  const ev = arg.event;
  const start = ev.start;
  const end = ev.end;

  let timeLine = "";
  if (!ev.allDay && start != null && end != null) {
    const a = getStartHour(start);
    const b = getStartHour(end);
    if (a && b) timeLine = `${a} – ${b}`;
  }
  const startHm = start != null ? getStartHour(start) : "";
  const showDayLabel = ev.allDay || startHm === "00:00";

  return (
    <div className="fc-custom-day-card px-1.5 py-1 text-sm min-w-0">
      <div className="font-semibold truncate">{ev.title}</div>
      {ev.allDay || timeLine ? (
        <div className="text-xs opacity-90">
          {showDayLabel ? "Día" : timeLine}
        </div>
      ) : null}
    </div>
  );
};

export default DayTimeCard;
