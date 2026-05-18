import { getStartHour } from "@/utils/dates";

const WeekTimeCard = ({ arg }) => {
  const ev = arg.event;
  const start = ev.start;
  const end = ev.end;
  const x = ev.extendedProps ?? {};
  const icon = x.icon;
  const subtitle = String(x.subtitle ?? "").trim();
  let timeLine = "";

  if (ev.allDay) {
    timeLine = "";
  } else if (arg.timeText) {
    timeLine = arg.timeText;
  } else if (start != null && end != null) {
    const a = getStartHour(start);
    const b = getStartHour(end);
    if (a && b) timeLine = `${a} – ${b}`;
  }

  return (
    <div
      className="fc-weekTimeCard"
      style={{
        backgroundColor: ev.backgroundColor,
        borderColor: ev.borderColor ?? ev.backgroundColor,
      }}
    >
      <div className="fc-weekTimeCard-titleRow">
        <span className="fc-weekTimeCard-title font-medium">{ev.title}</span>
        {icon ? (
          <img
            src={`/${icon}.svg`}
            alt=""
            className="h-3.5 w-3.5 shrink-0 object-contain brightness-0 invert"
            loading="lazy"
          />
        ) : null}
      </div>

      {timeLine ? (
        <span className="fc-weekTimeCard-meta truncate block">{timeLine}</span>
      ) : null}

      {subtitle ? (
        <span className="fc-weekTimeCard-meta truncate block text-[0.6875rem] opacity-85">
          {subtitle}
        </span>
      ) : null}
    </div>
  );
};



export default WeekTimeCard;


