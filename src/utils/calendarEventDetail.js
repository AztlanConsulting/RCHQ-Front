import {
  formatMexicoLongWeekdayCalendarDate,
  formatMexicoDayMonthCommaTime12h,
} from "./detalle-empleado.utils";

export const eventApiToDetail = (ev) => {
  if (!ev) return null;
  const x = ev.extendedProps ?? {};
  const start = ev.start;
  const end = ev.end;
  return {
    id: ev.id,
    title: ev.title,
    start,
    end,
    startStr: start != null ? start.toISOString?.() ?? String(start) : "",
    endStr: end != null ? end.toISOString?.() ?? String(end) : "",
    allDay: ev.allDay,
    backgroundColor: ev.backgroundColor,
    borderColor: ev.borderColor,
    subtitle: x.subtitle,
    description: x.description,
    focus: x.focus,
    focusLabel: x.focusLabel,
    scope: x.scope,
    scopeLabel: x.scopeLabel,
    eventType: x.eventType,
    date: x.date,
    icon: x.icon,
    status: x.status,
  };
};

/** Fecha (solo día de calendario): "Martes 5 de Mayo 2026" en zona México. */
export const formatEventCalendarDate = (value) =>
  formatMexicoLongWeekdayCalendarDate(value);

/** Inicio / fin: "1 de Mayo, 3:00pm" en zona México. */
export const formatEventDateTime = (value) =>
  formatMexicoDayMonthCommaTime12h(value);
