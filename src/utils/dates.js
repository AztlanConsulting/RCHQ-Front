export const normalToUTCWithOffset = (
    date,
    {
        days = 0,
        months = 0,
        years = 0,
        hours = 0,
        minutes = 0,
        seconds = 0,
    } = {},
) => {
    const newDate = new Date(
        Date.UTC(
            date.getUTCFullYear() + years,
            date.getUTCMonth() + months,
            date.getUTCDate() + days,
            date.getUTCHours() + hours,
            date.getUTCMinutes() + minutes,
            date.getUTCSeconds() + seconds,
        ),
    );

    return newDate;
};

export const isPastDate = (date) => {
    const now = new Date();
    return now > date;
};

/** HH:mm in UTC (matches FullCalendar timeZone="UTC" in baseCalendar). */
export const getStartHour = (timestamp) => {
    if (timestamp == null) return "";
    const base =
        timestamp instanceof Date
            ? new Date(timestamp.getTime())
            : new Date(timestamp);
    if (Number.isNaN(base.getTime())) return "";
    const h = base.getUTCHours();
    const m = base.getUTCMinutes();
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};
