import Dates from "./dates";

export const eventApiToDetail = (ev) => {
  console.log("event pre api convert: ", ev);
  if (!ev) return null;
  const x = ev.extendedProps ?? {};
  const start = ev.start;
  const end = ev.end;
  return {
    id: ev.id,
    absenceId: x.absenceId,
    absenceTypeId: x.absenceTypeId,
    employeeId: x.employeeId,
    title: ev.title,
    employeeName: x.employeeName,
    start,
    end,
    readableStart: x.startReadableDate,
    readableEnd: x.endReadableDate,
    startStr: start != null ? start.toISOString?.() ?? String(start) : "",
    endStr: end != null ? end.toISOString?.() ?? String(end) : "",
    allDay: ev.allDay,
    backgroundColor: ev.backgroundColor || ev.color,
    borderColor: ev.borderColor || ev.backgroundColor || ev.color,
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
    curp: x.curp,
    usedDays: x.usedDays,
    totalDays: x.totalDays,
    link: x.link,
    startDate: Dates.normalizeDateOnly(x.startDate ?? start),
    endDate: Dates.normalizeDateOnly(x.endDate ?? end),
    isDeleted: x.isDeleted,
    peopleInsideEvent: x.peopleInsideEvent ?? null,
  };
};

export const calendarItemToDetail = (item) => {
  if (!item) return null;

  return {
    id: item.id ?? item.absenceId ?? item.employeeId ?? item.name,
    absenceId: item.absenceId,
    absenceTypeId: item.absenceTypeId,
    employeeId: item.employeeId,
    title: item.focus === "ausencias" ? `Ausencia de ${item.name}` : item.name,
    employeeName: item.name,
    start: item.start,
    end: item.end,
    startStr: item.start ? item.start.toISOString?.() ?? String(item.start) : "",
    endStr: item.end ? item.end.toISOString?.() ?? String(item.end) : "",
    allDay: Boolean(item.lastsAllDay),
    backgroundColor: item.backgroundColor ?? item.color,
    borderColor: item.borderColor ?? item.color ?? item.backgroundColor,
    subtitle: item.subtitle ?? "",
    description: item.description ?? "",
    focus: item.focus,
    focusLabel: item.focusLabel ?? item.focus,
    scope: item.scope,
    scopeLabel: item.scopeLabel ?? item.scope,
    eventType: item.type,
    date: item.date ?? "",
    icon: item.icon ?? "",
    status: item.status,
    curp: item.curp ?? "",
    usedDays: item.usedDays,
    link: item.link ?? "",
    startDate: Dates.normalizeDateOnly(item.startDate ?? item.start),
    endDate: Dates.normalizeDateOnly(item.endDate ?? item.end),
    isDeleted: item.isDeleted,
  };
};
