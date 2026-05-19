export const normalToUTCWithOffset = (
    date,
    { days = 0, months = 0, years = 0, hours = 0, minutes = 0, seconds = 0 } = {},
) => {
    const newDate = new Date(
        Date.UTC(
            date.getFullYear() + years,
            date.getMonth() + months,
            date.getDate() + days,
            date.getHours() + hours,
            date.getMinutes() + minutes,
            date.getSeconds() + seconds,
        ),
    );

    return newDate;
};

export const isPastDate = (date) => {
    const now = new Date();
    return now > date;
};

// Offset applied before reading hours/minutes for day-grid event labels.
const DISPLAY_OFFSET_MS = 6 * 60 * 60 * 1000;

export class Dates {
    static getStartHour(timestamp) {
        if (timestamp == null) return "";
        const base =
            timestamp instanceof Date
                ? new Date(timestamp.getTime())
                : new Date(timestamp);
        if (Number.isNaN(base.getTime())) return "";
        const shifted = new Date(base.getTime() + DISPLAY_OFFSET_MS);
        const h = shifted.getHours();
        const m = shifted.getMinutes();
        return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    }
}
