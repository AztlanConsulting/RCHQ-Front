const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;
const DAY_MS = 24 * 60 * 60 * 1000;

const parseDateOnly = (value) => {
    if (!DATE_ONLY_PATTERN.test(String(value ?? ""))) return null;

    const [year, month, day] = String(value).split("-").map(Number);
    const date = new Date(year, month - 1, day, 12, 0, 0, 0);

    return Number.isNaN(date.getTime()) ? null : date;
};

const parseDateTime = (dateValue, timeValue) => {
    if (!DATE_ONLY_PATTERN.test(String(dateValue ?? ""))) return null;
    if (!TIME_PATTERN.test(String(timeValue ?? ""))) return null;

    const [year, month, day] = String(dateValue).split("-").map(Number);
    const [hour, minute] = String(timeValue).split(":").map(Number);
    const date = new Date(year, month - 1, day, hour, minute, 0, 0);

    return Number.isNaN(date.getTime()) ? null : date;
};

const formatDateOnly = (date) => {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

const formatTime = (date) => {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";

    const hour = String(date.getHours()).padStart(2, "0");
    const minute = String(date.getMinutes()).padStart(2, "0");

    return `${hour}:${minute}`;
};

export const shiftDateOnlyRange = (
    form,
    nextStartDate,
    { startDateKey = "startDate", endDateKey = "endDate" } = {},
) => {
    const previousStart = parseDateOnly(form?.[startDateKey]);
    const previousEnd = parseDateOnly(form?.[endDateKey]);
    const nextStart = parseDateOnly(nextStartDate);

    if (!previousStart || !previousEnd || !nextStart) {
        return {
            ...form,
            [startDateKey]: nextStartDate,
        };
    }

    const deltaDays = Math.round((nextStart - previousStart) / DAY_MS);
    const nextEnd = new Date(previousEnd);
    nextEnd.setDate(nextEnd.getDate() + deltaDays);

    return {
        ...form,
        [startDateKey]: nextStartDate,
        [endDateKey]: formatDateOnly(nextEnd),
    };
};

export const shiftDateTimeRange = (
    form,
    field,
    value,
    {
        startDateKey = "startDate",
        endDateKey = "endDate",
        startTimeKey = "startTime",
        endTimeKey = "endTime",
        allDayKey = "allDay",
    } = {},
) => {
    if (![startDateKey, startTimeKey].includes(field)) {
        return {
            ...form,
            [field]: value,
        };
    }

    if (form?.[allDayKey]) {
        if (field !== startDateKey) {
            return {
                ...form,
                [field]: value,
            };
        }

        return shiftDateOnlyRange(form, value, {
            startDateKey,
            endDateKey,
        });
    }

    const previousStart = parseDateTime(
        form?.[startDateKey],
        form?.[startTimeKey],
    );
    const previousEnd = parseDateTime(form?.[endDateKey], form?.[endTimeKey]);

    const nextStartDate = field === startDateKey ? value : form?.[startDateKey];
    const nextStartTime = field === startTimeKey ? value : form?.[startTimeKey];
    const nextStart = parseDateTime(nextStartDate, nextStartTime);

    if (
        !previousStart ||
        !previousEnd ||
        !nextStart ||
        previousEnd <= previousStart
    ) {
        return {
            ...form,
            [field]: value,
        };
    }

    const durationMs = previousEnd.getTime() - previousStart.getTime();
    const nextEnd = new Date(nextStart.getTime() + durationMs);

    return {
        ...form,
        [startDateKey]: nextStartDate,
        [startTimeKey]: nextStartTime,
        [endDateKey]: formatDateOnly(nextEnd),
        [endTimeKey]: formatTime(nextEnd),
    };
};
