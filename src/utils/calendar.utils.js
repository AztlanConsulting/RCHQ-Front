import CalendarConfigs from "./configs/calendar.configs";
import Dates from "./dates";

const API_URL = import.meta.env.VITE_API_URL;

/**
 * UI/helpers for calendar events: config lookups, API URL normalization,
 * and mapping FullCalendar/API shapes → detail cards.
 */
class CalendarUtils {
  /**
   * @param {{ scope?: string }} event — raw event with `scope` token (global | house | personal).
   * @returns {{ value, label, color } | undefined} — matching row from `CalendarConfigs.SCOPE_OPTIONS`, or undefined.
   */
  static getScopeOption = (event) => {
    return CalendarConfigs.SCOPE_OPTIONS.find((s) => s.value === event.scope);
  };

  /**
   * @param {{ focus?: string }} event — raw event with `focus` token (eventos | vacaciones | ausencias).
   * @returns {{ value, label, icon } | undefined} — matching row from `CalendarConfigs.FOCUS_OPTIONS`, or undefined.
   */
  static getFocusOption = (event) => {
    return CalendarConfigs.FOCUS_OPTIONS.find((f) => f.value === event.focus);
  };

  /**
   * For absence rows, turns relative evidence paths into full API URLs; clears `link` for non-absences.
   * @param {object} event — calendar event object (may include focus, absenceId, link, url).
   * @returns {object} — shallow clone of `event` with `link` set to absolute URL or "".
   */
  static normalizeCalendarEvent = (event) => {
    const isAbsence = event?.focus === "ausencias" || event?.absenceId;
    const evidencePath = isAbsence ? event?.link || event?.url || "" : "";

    const base = {
      ...event,
      link: evidencePath
        ? `${API_URL}/${String(evidencePath).replace(/^\/+/, "")}`
        : "",
    };

    if (!event?.lastsAllDay) {
      return {
        ...base,
        start:
          base.start != null
            ? Dates.shiftCalendarApiInstantForFullCalendar(base.start)
            : base.start,
        end:
          base.end != null
            ? Dates.shiftCalendarApiInstantForFullCalendar(base.end)
            : base.end,
      };
    }

    return base;
  };

  /**
   * Builds a browser-openable URL for absence evidence (relative path → `API_URL`, http(s) left as-is).
   * @param {string} [link] — path or full URL; falsy → "".
   * @returns {string} — full URL or "".
   */
  static buildAbsenceEvidenceUrl = (link) => {
    if (!link) return "";

    if (/^https?:\/\//i.test(link)) {
      return link;
    }

    const baseUrl = String(API_URL ?? "").replace(/\/+$/, "");
    const normalizedLink = String(link).replace(/^\/+/, "");

    return `${baseUrl}/${normalizedLink}`;
  };

  /**
   * Maps a FullCalendar event instance → flat “detail” object for cards/modals.
   * @param {object | null | undefined} ev — FullCalendar event (title, start, end, extendedProps, …).
   * @returns {object | null} — normalized detail shape, or null if `ev` is falsy.
   */
  static eventApiToDetail = (ev) => {
    if (!ev) return null;
    const x = ev.extendedProps ?? {};
    const start = ev.start;
    const end = ev.end;
    return {
      id: ev.id,
      houseEventId: x.houseEventId,
      eventId: x.eventId,
      eventTypeId: x.eventTypeId,
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
      isFreeDay: x.isFreeDay,
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

  /**
   * Maps an API/list “calendar item” shape → same detail shape as `eventApiToDetail` (different field names).
   * @param {object | null | undefined} item — e.g. absence row from range endpoint (`name`, `start`, `lastsAllDay`, …).
   * @returns {object | null} — detail object for UI, or null if `item` is falsy.
   */
  static calendarItemToDetail = (item) => {
    if (!item) return null;

    return {
      id: item.id ?? item.absenceId ?? item.employeeId ?? item.name,
      houseEventId: item.houseEventId,
      eventId: item.eventId,
      eventTypeId: item.eventTypeId,
      absenceId: item.absenceId,
      absenceTypeId: item.absenceTypeId,
      employeeId: item.employeeId,
      title: item.focus === "ausencias" ? `Ausencia de ${item.name}` : item.name,
      employeeName: item.name,
      start: item.start,
      end: item.end,
      startStr: item.start ? item.start.toISOString?.() ?? String(item.start) : "",
      endStr: item.end ? item.end.toISOString?.() ?? String(item.end) : "",
      allDay: Boolean(item.allDay || item.lastsAllDay),
      backgroundColor: item.backgroundColor ?? item.color,
      borderColor: item.borderColor ?? item.color ?? item.backgroundColor,
      subtitle: item.subtitle ?? "",
      description: item.description ?? "",
      focus: item.focus,
      focusLabel: item.focusLabel ?? item.focus,
      scope: item.scope,
      scopeLabel: item.scopeLabel ?? item.scope,
      eventType: item.type,
      isFreeDay: item.isFreeDay,
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
