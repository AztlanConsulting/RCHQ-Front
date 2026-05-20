import CalendarConfigs from "../configs/calendar.configs";
import Dates from "./dates";

const API_URL = import.meta.env.VITE_API_URL;

class CalendarUtils {
  static getScopeOption = (event) => {
    return CalendarConfigs.SCOPE_OPTIONS.find((s) => s.value === event.scope);
  };

  static getFocusOption = (event) => {
    return CalendarConfigs.FOCUS_OPTIONS.find((f) => f.value === event.focus);
  };

  static normalizeCalendarEvent = (event) => {
    const isAbsence = event?.focus === "ausencias" || event?.absenceId;
    const evidencePath = isAbsence ? event?.link || event?.url || "" : "";

    return {
      ...event,
      link: evidencePath
        ? `${API_URL}/${String(evidencePath).replace(/^\/+/, "")}`
        : "",
    };
  };

  static buildAbsenceEvidenceUrl = (link) => {
    if (!link) return "";

    if (/^https?:\/\//i.test(link)) {
      return link;
    }

    const baseUrl = String(API_URL ?? "").replace(/\/+$/, "");
    const normalizedLink = String(link).replace(/^\/+/, "");

    return `${baseUrl}/${normalizedLink}`;
  };

  static eventApiToDetail = (ev) => {
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

  static calendarItemToDetail = (item) => {
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
}

export default CalendarUtils;
