const DATE_ONLY_PATTERN = /^(\d{4}-\d{2}-\d{2})/;

export const normalizeDateOnly = (value) => {
    if (value == null || value === "") return "";

    if (typeof value === "string") {
        const trimmedValue = value.trim();
        const matchedDate = trimmedValue.match(DATE_ONLY_PATTERN);

        if (matchedDate) {
            return matchedDate[1];
        }
    }

    const parsedDate =
        value instanceof Date ? new Date(value.getTime()) : new Date(value);
    if (Number.isNaN(parsedDate.getTime())) return "";

    const year = parsedDate.getFullYear();
    const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
    const day = String(parsedDate.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

export const dateOnlyToLocalDate = (value) => {
    const normalizedValue = normalizeDateOnly(value);
    if (!normalizedValue) return null;

    const [year, month, day] = normalizedValue.split("-").map(Number);
    return new Date(year, month - 1, day, 12, 0, 0, 0);
};

export const addDaysToDateOnly = (value, days) => {
    const baseDate = dateOnlyToLocalDate(value);
    if (!baseDate) return "";

    baseDate.setDate(baseDate.getDate() + days);
    return normalizeDateOnly(baseDate);
};

export const calculateDateRangeDays = (startDate, endDate) => {
    const start = dateOnlyToLocalDate(startDate);
    const end = dateOnlyToLocalDate(endDate);

    if (!start || !end || end < start) return null;

    return Math.round((end - start) / 86400000) + 1;
};

export const eventApiToDetail = (ev) => {
    if (!ev) return null;
    const x = ev.extendedProps ?? {};
    const start = x.utcStart ? new Date(x.utcStart) : ev.start;
    const end = x.utcEnd ? new Date(x.utcEnd) : ev.end;
    return {
        id: ev.id,
        houseEventId: x.houseEventId,
        eventId: x.eventId,
        eventTypeId: x.eventTypeId,
        absenceId: x.absenceId,
        absenceTypeId: x.absenceTypeId,
        vacationId: x.vacationId,
        vacationRequestId: x.vacationRequestId,
        vacationStatus: x.vacationStatus,
        vacationFeedback: x.vacationFeedback,
        feedback: x.vacationFeedback ?? x.feedback ?? "",
        employeeId: x.employeeId,
        title: ev.title,
        employeeName: x.employeeName,
        start,
        end,
        readableStart: x.startReadableDate,
        readableEnd: x.endReadableDate,
        startStr: start != null ? (start.toISOString?.() ?? String(start)) : "",
        endStr: end != null ? (end.toISOString?.() ?? String(end)) : "",
        allDay: x.detailAllDay ?? ev.allDay,
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
        startDate: normalizeDateOnly(x.startDate ?? start),
        endDate: normalizeDateOnly(x.endDate ?? end),
        isDeleted: x.isDeleted,
        peopleInsideEvent: x.peopleInsideEvent ?? null,
    };
};

export const calendarItemToDetail = (item) => {
    if (!item) return null;

    const startDate = normalizeDateOnly(item.startDate ?? item.start);
    const endDate = normalizeDateOnly(item.endDate ?? item.end);

    const shouldCalculateTotalDays =
        item.focus === "vacaciones" || item.focus === "ausencias";

    const totalDays =
        item.totalDays ??
        (shouldCalculateTotalDays && startDate && endDate
            ? calculateDateRangeDays(startDate, endDate)
            : null);

    return {
        id: item.id ?? item.absenceId ?? item.employeeId ?? item.name,
        houseEventId: item.houseEventId,
        eventId: item.eventId,
        eventTypeId: item.eventTypeId,
        absenceId: item.absenceId,
        absenceTypeId: item.absenceTypeId,

        vacationId: item.vacationId,
        vacationRequestId: item.vacationRequestId,
        vacationStatus: item.vacationStatus ?? item.status,
        vacationFeedback: item.vacationFeedback ?? item.feedback,
        feedback: item.vacationFeedback ?? item.feedback ?? "",

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
        readableStart: item.startReadableDate ?? startDate,
        readableEnd: item.endReadableDate ?? endDate,
        allDay: Boolean(item.allDay),
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
        totalDays,
        link: item.link ?? "",
        startDate,
        endDate,
        isDeleted: item.isDeleted,
        peopleInsideEvent: item.peopleInsideEvent ?? null,
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

export const formatEventTime = (value, { timeZone } = {}) => {
    if (value == null || value === "") return "—";
    const d = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);

    return d.toLocaleTimeString("es-MX", {
        hour: "numeric",
        minute: "2-digit",
        ...(timeZone ? { timeZone } : {}),
    });
};

const normalizeUTCDateOnly = (value) => {
    if (value == null || value === "") return "";

    if (typeof value === "string") {
        const matchedDate = value.trim().match(DATE_ONLY_PATTERN);
        if (matchedDate) return matchedDate[1];
    }

    const parsedDate = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(parsedDate.getTime())) return "";

    const year = parsedDate.getUTCFullYear();
    const month = String(parsedDate.getUTCMonth() + 1).padStart(2, "0");
    const day = String(parsedDate.getUTCDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

const addDaysToUTCDateOnly = (value, days) => {
    const normalizedValue = normalizeUTCDateOnly(value);
    if (!normalizedValue) return "";

    const [year, month, day] = normalizedValue.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day + days, 0, 0, 0, 0));
    return normalizeUTCDateOnly(date);
};

export const formatEventDateOnly = (value) => {
    const normalizedValue = normalizeUTCDateOnly(value);
    if (!normalizedValue) return "—";

    return new Date(`${normalizedValue}T00:00:00.000Z`).toLocaleDateString(
        "es-MX",
        {
            dateStyle: "long",
            timeZone: "UTC",
        },
    );
};

export const formatEventDateRange = (
    start,
    end,
    { endExclusive = false } = {},
) => {
    const startDate = normalizeUTCDateOnly(start);
    const rawEndDate = normalizeUTCDateOnly(end);
    const endDate =
        endExclusive && rawEndDate
            ? addDaysToUTCDateOnly(rawEndDate, -1)
            : rawEndDate;

    if (!startDate && !endDate) return "—";
    if (!endDate || startDate === endDate) {
        return formatEventDateOnly(startDate || endDate);
    }

    return `${formatEventDateOnly(startDate)} - ${formatEventDateOnly(endDate)}`;
};

export const formatEventDate = (value) => {
    if (value == null || value === "") return "—";
    const dateOnly = dateOnlyToLocalDate(value);

    if (dateOnly) {
        return dateOnly.toLocaleDateString("es-MX", {
            dateStyle: "long",
        });
    }

    const parsedDate = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(parsedDate.getTime())) return String(value);

    return parsedDate.toLocaleDateString("es-MX", {
        dateStyle: "long",
    });
};
