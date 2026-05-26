export const MEXICO_TIME_ZONE = "America/Mexico_City";

export const getBrowserTimeZone = () =>
    Intl.DateTimeFormat().resolvedOptions().timeZone || MEXICO_TIME_ZONE;

export const isMexicoTimeZone = () =>
    getBrowserTimeZone() === MEXICO_TIME_ZONE;

const getPartsInTimeZone = (date, timeZone) => {
    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone,
        hourCycle: "h23",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    }).formatToParts(date);

    return Object.fromEntries(
        parts
            .filter((part) => part.type !== "literal")
            .map((part) => [part.type, part.value]),
    );
};

const getTimeZoneOffsetMs = (date, timeZone) => {
    const parts = getPartsInTimeZone(date, timeZone);
    const asUtc = Date.UTC(
        Number(parts.year),
        Number(parts.month) - 1,
        Number(parts.day),
        Number(parts.hour),
        Number(parts.minute),
        Number(parts.second),
    );

    return asUtc - date.getTime();
};

export const zonedDateTimeToIso = (
    date,
    time = "00:00",
    timeZone = getBrowserTimeZone(),
) => {
    const [year, month, day] = String(date).split("-").map(Number);
    const [hour, minute] = String(time || "00:00").split(":").map(Number);
    if ([year, month, day, hour, minute].some(Number.isNaN)) return "";

    const localAsUtc = Date.UTC(year, month - 1, day, hour, minute, 0, 0);
    const firstGuess = new Date(
        localAsUtc - getTimeZoneOffsetMs(new Date(localAsUtc), timeZone),
    );
    const finalGuess = new Date(
        localAsUtc - getTimeZoneOffsetMs(firstGuess, timeZone),
    );

    return finalGuess.toISOString();
};

export const dateInTimeZoneToInputValue = (
    value,
    timeZone = getBrowserTimeZone(),
) => {
    if (!value) return "";
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    const parts = getPartsInTimeZone(date, timeZone);

    return `${parts.year}-${parts.month}-${parts.day}`;
};

export const timeInTimeZoneToInputValue = (
    value,
    timeZone = getBrowserTimeZone(),
) => {
    if (!value) return "";
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    const parts = getPartsInTimeZone(date, timeZone);

    return `${parts.hour}:${parts.minute}`;
};

export const dateTimeInTimeZoneToCalendarValue = (
    value,
    timeZone = getBrowserTimeZone(),
) => {
    if (!value) return "";
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    const parts = getPartsInTimeZone(date, timeZone);

    return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}`;
};

export const getCalendarNowValue = (
    timeZone = getBrowserTimeZone(),
    now = new Date(),
) => dateTimeInTimeZoneToCalendarValue(now, timeZone);

const addDaysToDateOnly = (dateValue, days) => {
    const [year, month, day] = String(dateValue).split("-").map(Number);
    if ([year, month, day].some(Number.isNaN)) return "";

    const date = new Date(Date.UTC(year, month - 1, day + days, 0, 0, 0, 0));

    return [
        date.getUTCFullYear(),
        String(date.getUTCMonth() + 1).padStart(2, "0"),
        String(date.getUTCDate()).padStart(2, "0"),
    ].join("-");
};

export const getAllDayRangeInTimeZone = (
    startValue,
    endValue,
    timeZone = getBrowserTimeZone(),
) => {
    if (!startValue || !endValue) {
        return { isAllDay: false };
    }

    const startDate = startValue instanceof Date
        ? startValue
        : new Date(startValue);
    const endDate = endValue instanceof Date ? endValue : new Date(endValue);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
        return { isAllDay: false };
    }

    const startParts = getPartsInTimeZone(startDate, timeZone);
    const endParts = getPartsInTimeZone(endDate, timeZone);
    const startsAtMidnight =
        startParts.hour === "00" &&
        startParts.minute === "00" &&
        startParts.second === "00";
    const endsAtLastMinute =
        endParts.hour === "23" && endParts.minute === "59";
    const endsOnNextMidnight =
        endParts.hour === "00" &&
        endParts.minute === "00" &&
        endParts.second === "00";

    if (!startsAtMidnight || (!endsAtLastMinute && !endsOnNextMidnight)) {
        return { isAllDay: false };
    }

    const startDateOnly = `${startParts.year}-${startParts.month}-${startParts.day}`;
    const endDateOnly = `${endParts.year}-${endParts.month}-${endParts.day}`;
    const displayEndDate = endsOnNextMidnight
        ? addDaysToDateOnly(endDateOnly, -1)
        : endDateOnly;

    if (displayEndDate < startDateOnly) {
        return { isAllDay: false };
    }

    return {
        isAllDay: true,
        startDate: startDateOnly,
        displayEndDate,
        calendarEndDate: endsOnNextMidnight
            ? endDateOnly
            : addDaysToDateOnly(endDateOnly, 1),
    };
};
