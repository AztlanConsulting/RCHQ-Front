export const FOCUS_OPTIONS = [
    { value: "eventos",    label: "Eventos",    icon: "employee" },
    { value: "vacaciones", label: "Vacaciones", icon: "vacation" },
    { value: "ausencias",  label: "Ausencias",  icon: "absences" },
];

export const SCOPE_OPTIONS = [
    { value: "global",   label: "Global",   color: "#C524FF" },
    { value: "house",    label: "De Casa",  color: "#7FD447" },
    { value: "personal", label: "Personal", color: "#EFBF22" },
];

export const STATUS_OPTIONS = [
    { value: "aprobadas",  label: "Aprobadas" },
    { value: "en_espera",  label: "En espera" },
    { value: "rechazadas", label: "Rechazadas" },
];

export const getFocusOption = (event) => {
    return FOCUS_OPTIONS.find(
        (f) => f.value === event.focus
    );
}

export const getScopeOption = (event) => {
    return SCOPE_OPTIONS.find(
        (s) => s.value === event.scope
    );
}

// ─── calendar event API mapping ───────────────────────────────────────────────

// input:  raw FullCalendar event object (ev)
// output: normalized event detail object for UI consumption
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