// Offset applied before reading hours/minutes for day-grid event labels.
const DISPLAY_OFFSET_MS = 6 * 60 * 60 * 1000;

const DATE_ONLY_PATTERN = /^(\d{4}-\d{2}-\d{2})/;

const MEXICO_TZ = "America/Mexico_City";

/** Date-only strings, locale formatting, calendar math, and calendar-grid labels (Mexico). */
class Dates {
    /**
     * Shifts a local `Date` by the given calendar/time parts, then returns the result as a `Date`
     * built from `Date.UTC(...)`. Used when building range endpoints from FullCalendar selections.
     *
     * @param {Date} date — anchor instant in local time.
     * @param {{ days?: number, months?: number, years?: number, hours?: number, minutes?: number, seconds?: number }} [offsets] — deltas applied to the local Y/M/D/h/m/s before UTC conversion.
     * @returns {Date} — new `Date` from `Date.UTC(...)`.
     * @example
     * const t = new Date(2026, 4, 3, 10, 0, 0); // local 3 May 2026 10:00
     * Dates.normalToUTCWithOffset(t, { days: 1 })
     * // => Date corresponding to local calendar day +1 (same clock parts, shifted fields)
     * @example
     * Dates.normalToUTCWithOffset(info.end, { seconds: -1 }) // end-exclusive range minus 1s
     */
    static normalToUTCWithOffset(
        date,
        { days = 0, months = 0, years = 0, hours = 0, minutes = 0, seconds = 0 } = {},
    ) {
        return new Date(
            Date.UTC(
                date.getFullYear() + years,
                date.getMonth() + months,
                date.getDate() + days,
                date.getHours() + hours,
                date.getMinutes() + minutes,
                date.getSeconds() + seconds,
            ),
        );
    }

    /**
     * @param {Date} date — instant to compare to “now”.
     * @returns {boolean} — `true` if `date` is strictly before the current time.
     * @example
     * Dates.isPastDate(new Date(2000, 0, 1)) // => true (unless system clock before 2000)
     * @example
     * Dates.isPastDate(new Date(2100, 0, 1)) // => false (typical dev machine in 2020s)
     */
    static isPastDate(date) {
        const now = new Date();
        return now > date;
    }

    /**
     * Title-cases a single Spanish word/fragment from `Intl` (weekday/month) for grid headers.
     *
     * @param {string} word
     * @returns {string}
     * @example
     * Dates.capitalizeEs("  miércoles  ") // => "Miércoles"
     * @example
     * Dates.capitalizeEs("ABRIL") // => "Abril"
     */
    static capitalizeEs(word) {
        if (!word) return word;
        const w = word.trim();
        return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    }

    /**
     * Hour:minute for day-grid labels; applies `DISPLAY_OFFSET_MS` before reading clock fields
     * (legacy alignment with how slices were authored).
     *
     * @param {Date | string | number | null | undefined} timestamp
     * @returns {string} — `"HH:mm"` or `""` if invalid/missing.
     * @example
     * // Depends on local TZ + offset constant; shape is always two digits each:
     * Dates.getStartHour(new Date("2026-05-01T14:30:00")) // => "14:30" after internal shift (or nearby)
     */
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

    /**
     * @param {string | null | undefined} value — ISO or date-only string.
     * @returns {string} — first 10 chars (`YYYY-MM-DD`) or `""`.
     * @example
     * Dates.isoDatePrefix("2026-05-15T00:00:00.000Z") // => "2026-05-15"
     * @example
     * Dates.isoDatePrefix(null) // => ""
     */
    static isoDatePrefix(value) {
        if (value == null || value === "") return "";
        return String(value).slice(0, 10);
    }

    /**
     * Normalizes many inputs to a **calendar date** `YYYY-MM-DD` using **local** getters when parsing `Date`,
     * or the first `YYYY-MM-DD` segment when the string already starts that way.
     *
     * @param {string | Date | null | undefined} value
     * @returns {string} — `YYYY-MM-DD`, or `""` if empty/invalid.
     * @example
     * Dates.normalizeDateOnly("2026-05-15") // => "2026-05-15"
     * @example
     * Dates.normalizeDateOnly("2026-05-15T23:00:00.000Z") // => local calendar Y-M-D, e.g. "2026-05-15" in GMT-6
     */
    static normalizeDateOnly(value) {
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
    }

    /**
     * Stable `Date` at **local noon** for a date-only string (avoids DST boundary issues for pure dates).
     *
     * @param {string | Date | null | undefined} value — passed through `normalizeDateOnly` first.
     * @returns {Date | null} — local noon on that calendar day, or null if no valid date-only.
     * @example
     * const d = Dates.dateOnlyToLocalDate("2026-05-15");
     * d.getFullYear() === 2026 && d.getMonth() === 4 && d.getDate() === 15 // => true
     * d.getHours() === 12 // local noon anchor
     */
    static dateOnlyToLocalDate(value) {
        const normalizedValue = Dates.normalizeDateOnly(value);
        if (!normalizedValue) return null;

        const [year, month, day] = normalizedValue.split("-").map(Number);
        return new Date(year, month - 1, day, 12, 0, 0, 0);
    }

    /**
     * @param {string | Date | null | undefined} value — date-only base.
     * @param {number} days — integer delta (can be negative).
     * @returns {string} — resulting `YYYY-MM-DD` via `normalizeDateOnly`, or `""` if base invalid.
     * @example
     * Dates.addDaysToDateOnly("2026-05-15", 5) // => "2026-05-20"
     * @example
     * Dates.addDaysToDateOnly("2026-05-15", -1) // => "2026-05-14"
     */
    static addDaysToDateOnly(value, days) {
        const baseDate = Dates.dateOnlyToLocalDate(value);
        if (!baseDate) return "";

        baseDate.setDate(baseDate.getDate() + days);
        return Dates.normalizeDateOnly(baseDate);
    }

    /**
     * Long Spanish date for **detail** views (`dateStyle: "long"`). Prefers date-only semantics via `dateOnlyToLocalDate`.
     *
     * @param {string | Date | null | undefined} value
     * @returns {string} — e.g. `"15 de mayo de 2026"`, `"—"` if empty, or raw string if unparseable.
     * @example
     * Dates.formatEventDate("2026-05-15") // => "15 de mayo de 2026" (es-MX long)
     * @example
     * Dates.formatEventDate("") // => "—"
     */
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

    /**
     * **Month grid** header-style line: weekday + day + month + year in `America/Mexico_City`.
     * Overlaps conceptually with `formatEventDate` but fixes timezone + custom layout.
     *
     * @param {string | Date | null | undefined} value
     * @returns {string} — e.g. `"Jueves 30 de abril de 2026"`, or `"—"` if invalid.
     * @example
     * // For a valid ISO instant, output is weekday + Spanish month in Mexico TZ:
     * Dates.formatEventCalendarDate("2026-04-30T12:00:00.000Z")
     * // => "Jueves 30 de abril de 2026" (wording depends on TZ rules)
     */
    static formatEventCalendarDate(value) {
        if (!value) return "—";
        const d = value instanceof Date ? value : new Date(String(value));
        if (Number.isNaN(d.getTime())) return "—";
        const weekday = Dates.capitalizeEs(
            new Intl.DateTimeFormat("es-MX", {
                weekday: "long",
                timeZone: MEXICO_TZ,
            }).format(d),
        );
        const dayNum = new Intl.DateTimeFormat("es-MX", {
            day: "numeric",
            timeZone: MEXICO_TZ,
        }).format(d);
        const month = Dates.capitalizeEs(
            new Intl.DateTimeFormat("es-MX", {
                month: "long",
                timeZone: MEXICO_TZ,
            }).format(d),
        );
        const year = new Intl.DateTimeFormat("es-MX", {
            year: "numeric",
            timeZone: MEXICO_TZ,
        }).format(d);
        return `${weekday} ${dayNum} de ${month} ${year}`;
    }

    /**
     * Medium date + short time in **browser local** (`es-MX`). Differs from UTC-normalized detail formatters elsewhere.
     *
     * @param {string | Date | null | undefined} value
     * @returns {string} — `toLocaleString` result, `"—"` if empty, or `String(value)` if invalid date.
     * @example
     * Dates.formatEventDateTime(null) // => "—"
     * @example
     * // Shape: medium date + short time, e.g. "3 may 2026, 4:00 p. m." (exact string varies by locale runtime)
     */
    static formatEventDateTime(value) {
        if (value == null || value === "") return "—";
        const d = value instanceof Date ? value : new Date(value);
        if (Number.isNaN(d.getTime())) return String(value);
        return d.toLocaleString("es-MX", {
            dateStyle: "medium",
            timeStyle: "short",
        });
    }

    /**
     * @param {string | null | undefined} isoString — e.g. API workday `1970-01-01T08:00:00.000Z`.
     * @returns {string} — `"HH:mm"` in **UTC**, or `"N/A"` if falsy.
     * @example
     * Dates.parseUTCDateToHours("1970-01-01T08:00:00.000Z") // => "08:00"
     * @example
     * Dates.parseUTCDateToHours("") // => "N/A"
     */
    static parseUTCDateToHours(isoString) {
        if (!isoString) return "N/A";
        const d = new Date(isoString);
        const h = String(d.getUTCHours()).padStart(2, "0");
        const m = String(d.getUTCMinutes()).padStart(2, "0");
        return `${h}:${m}`;
    }

    /**
     * Inclusive count of calendar days between two date-only values (via local noon Dates).
     * Same semantics as legacy list expansion (`Math.round(ms/86400000) + 1`).
     *
     * @param {string | Date} startValue — date-only or parseable value.
     * @param {string | Date} endValue
     * @returns {number} — inclusive day count; `0` if either bound invalid.
     * @example
     * Dates.inclusiveDaySpan("2026-05-01", "2026-05-01") // => 1
     * @example
     * Dates.inclusiveDaySpan("2026-05-01", "2026-05-03") // => 3
     */
    static inclusiveDaySpan(startValue, endValue) {
        const start = Dates.dateOnlyToLocalDate(startValue);
        const end = Dates.dateOnlyToLocalDate(endValue);
        if (!start || !end) return 0;
        return Math.round((end.getTime() - start.getTime()) / 86400000) + 1;
    }
}

export default Dates;
