class Dates {
  static MEXICO_TZ = "America/Mexico_City";

  /** API / legacy payloads: timestamps marked Z but representing México wall time (+6h vs naive UTC). */
  static CALENDAR_DISPLAY_OFFSET_MS = 6 * 60 * 60 * 1000;

  static DATE_ONLY_PATTERN = /^(\d{4}-\d{2}-\d{2})/;

  /**
   * México wall-clock workday slots for FullCalendar when using timeZone="UTC"
   * and timed events have been passed through shiftCalendarApiInstantForFullCalendar.
   */
  static FULLCALENDAR_UTC_SLOTS_MEXICO_WORKDAY = Object.freeze(
    (() => {
      const h = 6; // CALENDAR_DISPLAY_OFFSET_MS / (60 * 60 * 1000)
      const hh = (wall) =>
        `${String(Math.trunc(wall + h)).padStart(2, "0")}:00:00`;
      return {
        slotMinTime: hh(8),
        slotMaxTime: hh(18),
        scrollTime: hh(8),
      };
    })(),
  );

  static isDateOnlyString(value) {
    if (value == null || value === "" || value instanceof Date) return false;
    return /^\d{4}-\d{2}-\d{2}$/.test(String(value).trim());
  }

  static normalizeUTCDateOnly(value) {
    if (value == null || value === "") return "";
    if (typeof value === "string") {
      const matchedDate = value.trim().match(Dates.DATE_ONLY_PATTERN);
      if (matchedDate) return matchedDate[1];
    }
    const parsedDate = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(parsedDate.getTime())) return "";
    const year = parsedDate.getUTCFullYear();
    const month = String(parsedDate.getUTCMonth() + 1).padStart(2, "0");
    const day = String(parsedDate.getUTCDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  static addDaysToUTCDateOnly(value, days) {
    const normalizedValue = Dates.normalizeUTCDateOnly(value);
    if (!normalizedValue) return "";
    const [year, month, day] = normalizedValue.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day + days, 0, 0, 0, 0));
    return Dates.normalizeUTCDateOnly(date);
  }

  static formatEventUTCOnlyLong(value) {
    const normalizedValue = Dates.normalizeUTCDateOnly(value);
    if (!normalizedValue) return "—";
    return new Date(`${normalizedValue}T00:00:00.000Z`).toLocaleDateString(
      "es-MX",
      { dateStyle: "long", timeZone: "UTC" },
    );
  }

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

  static isPastDate(date) {
    const now = new Date();
    return now > date;
  }

  /** Align scheduled API instants so FullCalendar and Date getters match México wall clock. */
  static shiftCalendarApiInstantForFullCalendar(value) {
    if (value == null || value === "") return value;
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
      return value;
    }
    const d = value instanceof Date ? new Date(value.getTime()) : new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return new Date(d.getTime() + Dates.CALENDAR_DISPLAY_OFFSET_MS);
  }

  /** Hour:minute in the user's local TZ (use after shiftCalendarApiInstantForFullCalendar for API-derived datetimes). */
  static getStartHour(timestamp) {
    if (timestamp == null) return "";
    const base =
      timestamp instanceof Date ? new Date(timestamp.getTime()) : new Date(timestamp);
    if (Number.isNaN(base.getTime())) return "";
    const h = base.getHours();
    const m = base.getMinutes();
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }

  /** First 10 chars (YYYY-MM-DD) for ISO / date strings used in payloads. */
  static isoDatePrefix(value) {
    if (value == null || value === "") return "";
    return String(value).slice(0, 10);
  }

  static normalizeDateOnly(value) {
    if (value == null || value === "") return "";

    if (typeof value === "string") {
      const trimmedValue = value.trim();
      const matchedDate = trimmedValue.match(Dates.DATE_ONLY_PATTERN);

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

  /** ISO string, Date, or YYYY-MM-DD (anchored UTC noon). */
  static coerceEventDateInput(value) {
    if (value == null || value === "") return null;
    if (value instanceof Date) {
      return Number.isNaN(value.getTime()) ? null : value;
    }
    const s = String(value).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
      const [y, mo, d] = s.split("-").map(Number);
      return new Date(Date.UTC(y, mo - 1, d, 12, 0, 0));
    }
    const d = new Date(s);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  /** Día en rejilla: "Jueves 30 de Abril 2026" (zona México sobre el instante). */
  static formatEventCalendarDate(value) {
    if (!value) return "—";
    const d = value instanceof Date ? value : new Date(String(value));
    if (Number.isNaN(d.getTime())) return "—";
    const weekday = Dates.capitalizeEs(
      new Intl.DateTimeFormat("es-MX", { weekday: "long", timeZone: Dates.MEXICO_TZ }).format(d),
    );
    const dayNum = new Intl.DateTimeFormat("es-MX", { day: "numeric", timeZone: Dates.MEXICO_TZ }).format(d);
    const month = Dates.capitalizeEs(
      new Intl.DateTimeFormat("es-MX", { month: "long", timeZone: Dates.MEXICO_TZ }).format(d),
    );
    const year = new Intl.DateTimeFormat("es-MX", { year: "numeric", timeZone: Dates.MEXICO_TZ }).format(d);
    return `${weekday} ${dayNum} de ${month} ${year}`;
  }

  /** Inicio/fin en zona México (usa el instante UTC ya normalizado en el cliente). */
  static formatEventDateTime(value) {
    if (!value) return "—";
    const raw = value instanceof Date ? value : new Date(String(value));
    if (Number.isNaN(raw.getTime())) return "—";
    const dayNum = new Intl.DateTimeFormat("es-MX", { day: "numeric", timeZone: Dates.MEXICO_TZ }).format(raw);
    const month = Dates.capitalizeEs(
      new Intl.DateTimeFormat("es-MX", { month: "long", timeZone: Dates.MEXICO_TZ }).format(raw),
    );
    const timeRaw = new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: Dates.MEXICO_TZ,
    }).format(raw);
    return `${dayNum} de ${month}, ${timeRaw.toLowerCase().replace(/\s/g, "")}`;
  }

  /** p.ej. "Martes 5 de Mayo 2026". */
  static formatMexicoLongWeekdayCalendarDate(value) {
    const d0 = Dates.coerceEventDateInput(value);
    if (!d0) return "—";
    const dateOnly = Dates.isDateOnlyString(value);
    const d = dateOnly ? new Date(d0.getTime() + Dates.CALENDAR_DISPLAY_OFFSET_MS) : d0;
    const tz = dateOnly ? "UTC" : Dates.MEXICO_TZ;
    const weekday = Dates.capitalizeEs(
      new Intl.DateTimeFormat("es-MX", { weekday: "long", timeZone: tz }).format(d),
    );
    const dayNum = new Intl.DateTimeFormat("es-MX", { day: "numeric", timeZone: tz }).format(d);
    const month = Dates.capitalizeEs(
      new Intl.DateTimeFormat("es-MX", { month: "long", timeZone: tz }).format(d),
    );
    const year = new Intl.DateTimeFormat("es-MX", { year: "numeric", timeZone: tz }).format(d);
    return `${weekday} ${dayNum} de ${month} ${year}`;
  }

  /** p.ej. "1 de Mayo, 3:00pm". */
  static formatMexicoDayMonthCommaTime12h(value) {
    const d0 = Dates.coerceEventDateInput(value);
    if (!d0) return "—";
    const dateOnly = Dates.isDateOnlyString(value);
    const d = dateOnly ? new Date(d0.getTime() + Dates.CALENDAR_DISPLAY_OFFSET_MS) : d0;
    const tz = dateOnly ? "UTC" : Dates.MEXICO_TZ;
    const dayNum = new Intl.DateTimeFormat("es-MX", { day: "numeric", timeZone: tz }).format(d);
    const month = Dates.capitalizeEs(
      new Intl.DateTimeFormat("es-MX", { month: "long", timeZone: tz }).format(d),
    );
    const timeRaw = new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: tz,
    }).format(d);
    return `${dayNum} de ${month}, ${timeRaw.toLowerCase().replace(/\s/g, "")}`;
  }

  static parseUTCDateToHours(isoString) {
    if (!isoString) return "N/A";
    const d = new Date(isoString);
    const h = String(d.getUTCHours()).padStart(2, "0");
    const m = String(d.getUTCMinutes()).padStart(2, "0");
    return `${h}:${m}`;
  }

  /** Rango día en tarjeta (UTC date-only): legacy alinear con payloads Z/API. */
  static formatEventDateRange(start, end, { endExclusive = false } = {}) {
    const startDate = Dates.normalizeUTCDateOnly(start);
    const rawEndDate = Dates.normalizeUTCDateOnly(end);
    const endDate =
      endExclusive && rawEndDate ? Dates.addDaysToUTCDateOnly(rawEndDate, -1) : rawEndDate;

    if (!startDate && !endDate) return "—";
    if (!endDate || startDate === endDate) {
      return Dates.formatEventUTCOnlyLong(startDate || endDate);
    }

    return `${Dates.formatEventUTCOnlyLong(startDate)} - ${Dates.formatEventUTCOnlyLong(endDate)}`;
  }

  /** Hora solo (UTC), p. ej. inicio/fin en eventos timed. */
  static formatEventTime(value) {
    if (value == null || value === "") return "—";
    const d = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toLocaleTimeString("es-MX", {
      hour: "numeric",
      minute: "2-digit",
      timeZone: Dates.MEXICO_TZ,
    });
  }

  /** Ausencias: fechas solo-día con es-MX largo. */
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

  /** Inclusive calendar-day span (local noon anchoring via dateOnlyToLocalDate). */
  static inclusiveDaySpan(startValue, endValue) {
    const start = Dates.dateOnlyToLocalDate(startValue);
    const end = Dates.dateOnlyToLocalDate(endValue);
    if (!start || !end) return 0;
    return Math.round((end.getTime() - start.getTime()) / 86400000) + 1;
  }

  static capitalizeEs(word) {
    if (!word) return word;
    const w = word.trim();
    return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
  }

  static formatDate(value) {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return new Intl.DateTimeFormat("es-MX", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "UTC",
    }).format(date);
  }
}

export default Dates;
