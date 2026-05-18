import { getStartHour } from "@/utils/dates";

const DayTimeCard = ({ arg }) => {
  const ev = arg.event;
  const start = ev.start;
  const end = ev.end;
  const x = ev.extendedProps ?? {};
  const icon = x.icon;
  const subtitle = String(x.subtitle ?? "").trim();
  const description = String(x.description ?? "").trim();

  let timeLine = "";
  if (!ev.allDay && start != null && end != null) {
    const a = getStartHour(start);
    const b = getStartHour(end);
    if (a && b) timeLine = `${a} – ${b}`;
  }
  const startHm = start != null ? getStartHour(start) : "";
  const showDayLabel = ev.allDay || startHm === "00:00";

  return (
    <div
      className="fc-dayTimeCard"
      style={{
        backgroundColor: ev.backgroundColor,
        borderColor: ev.borderColor ?? ev.backgroundColor,
      }}
    >
      <div className="fc-dayTimeCard-titleRow">
        <span className="fc-dayTimeCard-title font-medium">{ev.title}</span>
        {icon ? (
          <img
            src={`/${icon}.svg`}
            alt=""
            className="h-3.5 w-3.5 shrink-0 object-contain brightness-0 invert"
            loading="lazy"
          />
        ) : null}
      </div>

      {ev.allDay || timeLine ? (
        <span className="fc-dayTimeCard-meta truncate block">
          {showDayLabel ? "Día" : timeLine}
        </span>
      ) : null}

      {subtitle ? (
        <span className="fc-dayTimeCard-subtitle block">{subtitle}</span>
      ) : null}

      {description ? (
        <div className="fc-dayTimeCard-description">{description}</div>
      ) : null}
    </div>
  );
};

export default DayTimeCard;
