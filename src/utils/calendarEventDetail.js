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

export const formatEventDateTime = (value) => {
  if (value == null || value === "") return "—";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};
