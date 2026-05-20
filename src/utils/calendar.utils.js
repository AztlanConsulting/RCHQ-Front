import CalendarConfigs from "../configs/calendar.configs";

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
}

export default CalendarUtils;
