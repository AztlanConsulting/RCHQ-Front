import { normalizeDateOnly } from "./dates";

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

export const ABSENCE_STATUS_OPTIONS = [
    { value: "no_eliminadas", label: "No eliminadas" },
    { value: "eliminadas", label: "Eliminadas" },
];

export const ABSENCE_EVIDENCE_OPTIONS = [
    { value: "con_evidencia", label: "Con evidencia" },
    { value: "sin_evidencia", label: "Sin evidencia" },
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

// ─── FullCalendar / API → detalle de evento (usa normalizeDateOnly de dates) ───

export const eventApiToDetail = (ev) => {
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
        curp: x.curp,
        usedDays: x.usedDays,
        link: x.link,
        startDate: normalizeDateOnly(x.startDate ?? start),
        endDate: normalizeDateOnly(x.endDate ?? end),
        isDeleted: x.isDeleted,
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
        borderColor: item.borderColor ?? item.color,
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
        startDate: normalizeDateOnly(item.startDate ?? item.start),
        endDate: normalizeDateOnly(item.endDate ?? item.end),
        isDeleted: item.isDeleted,
    };
};
