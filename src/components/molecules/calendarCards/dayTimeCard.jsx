import { getStartHour } from "@/utils/dates";
import {
  formatCardSchedulePoint,
  formatCompactDateRange,
} from "@/utils/calendarEventDetail";

const buildAllDaySlotScheduleLine = (ev, x, { isMultiDay, isRangeRecord }) => {
  if (isMultiDay && x.sourceStart != null && x.sourceEnd != null) {
    const startLabel = formatCardSchedulePoint(x.sourceStart);
    const endLabel = formatCardSchedulePoint(x.sourceEnd);
    if (startLabel && endLabel) return `${startLabel} - ${endLabel}`;
  }

  if (isRangeRecord && (x.startReadableDate || x.startDate)) {
    return formatCompactDateRange(
      x.startReadableDate || x.startDate,
      x.endReadableDate || x.endDate,
    );
  }

  const singleDate = x.sourceStart ?? x.startReadableDate ?? x.startDate ?? ev.start;
  return formatCardSchedulePoint(singleDate, {
    includeTime: !ev.allDay && !isMultiDay,
  });
};

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
  const isAllDaySlot = Boolean(ev.allDay && isTimeGridView);
  const showAsAllDay = ev.allDay;
  const icon = x.icon;
  const subtitle = String(x.subtitle ?? "").trim();
  const description = String(x.description ?? "").trim();

  const scheduleLine = isAllDaySlot
    ? buildAllDaySlotScheduleLine(ev, x, { isMultiDay, isRangeRecord })
    : "";

  let timeLine = "";
  if (!isAllDaySlot && start != null && end != null) {
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
        <div className="fc-dayTimeCard-titleTrail">
          {scheduleLine || timeLine ? (
            <span className="fc-dayTimeCard-time">
              {scheduleLine || timeLine}
            </span>
          ) : null}
          {icon ? (
            <img
              src={`/${icon}.svg`}
              alt=""
              className="h-3.5 w-3.5 shrink-0 object-contain brightness-0 invert"
              loading="lazy"
            />
          ) : null}
        </div>
      </div>

      {!isAllDaySlot && subtitle ? (
        <span className="fc-dayTimeCard-subtitle block">{subtitle}</span>
      ) : null}

      {!isAllDaySlot ? (
        description ? (
          <div className="fc-dayTimeCard-description">{description}</div>
        ) : (
          <div className="fc-dayTimeCard-description">Sin descripción</div>
        )
      ) : null}
    </div>
  );
};

export default DayTimeCard;
