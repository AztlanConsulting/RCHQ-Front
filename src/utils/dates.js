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

const DATE_ONLY_PATTERN = /^(\d{4}-\d{2}-\d{2})/;

class Dates {
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

    /** YYYY-MM-DD prefix for payloads / forms (UTC calendar date from ISO-ish strings). */
    static isoDatePrefix(value) {
        if (value == null || value === "") return "";
        return String(value).slice(0, 10);
    }

    static normalizeDateOnly(value) {
        if (value == null || value === "") return "";

        if (typeof value === "string") {
            const trimmedValue = value.trim();
            const matchedDate = trimmedValue.match(DATE_ONLY_PATTERN);

            if (matchedDate) {
                return matchedDate[1];
            }
        }

        const parsedDate = value instanceof Date ? new Date(value.getTime()) : new Date(value);
        if (Number.isNaN(parsedDate.getTime())) return "";

        const year = parsedDate.getFullYear();
        const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
        const day = String(parsedDate.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    static dateOnlyToLocalDate(value) {
        const normalizedValue = Dates.normalizeDateOnly(value);
        if (!normalizedValue) return null;

        const [year, month, day] = normalizedValue.split("-").map(Number);
        return new Date(year, month - 1, day, 12, 0, 0, 0);
    }

    static addDaysToDateOnly(value, days) {
        const baseDate = Dates.dateOnlyToLocalDate(value);
        if (!baseDate) return "";

        baseDate.setDate(baseDate.getDate() + days);
        return Dates.normalizeDateOnly(baseDate);
    }

    static formatEventDate(value) {
        if (value == null || value === "") return "—";
        const dateOnly = Dates.dateOnlyToLocalDate(value);

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
    }

    static formatEventDateTime(value) {
        if (value == null || value === "") return "—";
        const d = value instanceof Date ? value : new Date(value);
        if (Number.isNaN(d.getTime())) return String(value);
        return d.toLocaleString("es-MX", {
            dateStyle: "medium",
            timeStyle: "short",
        });
    }

    /** ISO UTC time → "HH:mm" (hours used in employee workday rows). */
    static parseUTCDateToHours(isoString) {
        if (!isoString) return "N/A";
        const d = new Date(isoString);
        const h = String(d.getUTCHours()).padStart(2, "0");
        const m = String(d.getUTCMinutes()).padStart(2, "0");
        return `${h}:${m}`;
    }

    /**
     * Inclusive count of calendar days between two date-only values (via local noon Dates).
     * Same semantics as legacy list expansion (Math.round(ms/86400000) + 1).
     */
    static inclusiveDaySpan(startValue, endValue) {
        const start = Dates.dateOnlyToLocalDate(startValue);
        const end = Dates.dateOnlyToLocalDate(endValue);
        if (!start || !end) return 0;
        return Math.round((end.getTime() - start.getTime()) / 86400000) + 1;
    }
}

export default Dates;