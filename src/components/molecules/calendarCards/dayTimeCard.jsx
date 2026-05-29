import { getStartHour } from "@/utils/dates";
import { formatEventDateRange } from "@/utils/calendarEventDetail";

const DayTimeCard = ({ arg }) => {
  const ev = arg.event;
  const start = ev.start;
  const end = ev.end;
  const x = ev.extendedProps ?? {};
  const isMultiDay = Boolean(x.multiDay);
  const isRangeRecord =
    x.focus === "vacaciones" || x.focus === "ausencias";
  const isTimeGridView =
    arg.view.type === "timeGridWeek" || arg.view.type === "timeGridDay";
  const showAsAllDay = ev.allDay || (isMultiDay && isTimeGridView);
  const showDayRange = isMultiDay || isRangeRecord;
  const icon = x.icon;
  const subtitle = String(x.subtitle ?? "").trim();
  const description = String(x.description ?? "").trim();

  const dayLine =
    showDayRange && (x.startReadableDate || x.startDate)
      ? formatEventDateRange(
            x.startReadableDate || x.startDate,
            x.endReadableDate || x.endDate,
            {
              endExclusive: isRangeRecord,
            },
        )
      : "";

  let timeLine = "";
  if (isMultiDay && x.sourceStart != null && x.sourceEnd != null) {
    const a = getStartHour(x.sourceStart);
    const b = getStartHour(x.sourceEnd);
    if (a && b) timeLine = `${a} – ${b}`;
  } else if (!showAsAllDay && start != null && end != null) {
    const a = getStartHour(start);
    const b = getStartHour(end);
    if (a && b) timeLine = `${a} – ${b}`;
  }

  return (
    <div
      className={`fc-dayTimeCard${showAsAllDay ? " fc-dayTimeCard--allday" : ""}`}
      style={{
        backgroundColor: ev.backgroundColor,
        borderColor: ev.borderColor ?? ev.backgroundColor,
      }}
    >
      <div className="fc-dayTimeCard-titleRow">
        <span className="fc-dayTimeCard-title font-medium text-base">{ev.title}</span>
        {icon ? (
          <img
            src={`/${icon}.svg`}
            alt=""
            className="h-3.5 w-3.5 shrink-0 object-contain brightness-0 invert"
            loading="lazy"
          />
        ) : null}
      </div>

      {dayLine ? (
        <span className="fc-dayTimeCard-meta block">{dayLine}</span>
      ) : null}

      {timeLine ? (
        <span className="fc-dayTimeCard-meta block">
          {timeLine}
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
