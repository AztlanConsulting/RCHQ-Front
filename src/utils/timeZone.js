export const MEXICO_TIME_ZONE = "America/Mexico_City";

export const getBrowserTimeZone = () =>
    Intl.DateTimeFormat().resolvedOptions().timeZone || MEXICO_TIME_ZONE;

export const isMexicoTimeZone = () =>
    getBrowserTimeZone() === MEXICO_TIME_ZONE;

export const isMexicoCalendarTimeZone = (timeZone) =>
    (timeZone || getBrowserTimeZone()) === MEXICO_TIME_ZONE;

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
