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
        startStr: start != null ? (start.toISOString?.() ?? String(start)) : "",
        endStr: end != null ? (end.toISOString?.() ?? String(end)) : "",
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
        startDate: x.startDate,
        endDate: x.endDate,
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
        title:
            item.focus === "ausencias" ? `Ausencia de ${item.name}` : item.name,
        employeeName: item.name,
        start: item.start,
        end: item.end,
        startStr: item.start
            ? (item.start.toISOString?.() ?? String(item.start))
            : "",
        endStr: item.end ? (item.end.toISOString?.() ?? String(item.end)) : "",
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
        startDate: item.startDate ?? item.start,
        endDate: item.endDate ?? item.end,
        isDeleted: item.isDeleted,
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

export const formatEventDate = (value) => {
    if (value == null || value === "") return "—";
    const d = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toLocaleDateString("es-MX", {
        dateStyle: "long",
    });
};
