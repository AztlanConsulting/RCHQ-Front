// ─── calendar navigation (local wall-clock → UTC) ────────────────────────────

export const normalToUTCWithOffset = (
  date,
  { days = 0, months = 0, years = 0, hours = 0, minutes = 0, seconds = 0 } = {},
) =>
  new Date(
    Date.UTC(
      date.getFullYear() + years,
      date.getMonth() + months,
      date.getDate() + days,
      date.getHours() + hours,
      date.getMinutes() + minutes,
      date.getSeconds() + seconds,
    ),
  );

// ─── shared constants ─────────────────────────────────────────────────────────

const MEXICO_TZ = "America/Mexico_City";

/** API / legacy payloads: timestamps marked Z but representing México wall time (+6h vs naive UTC). */
export const CALENDAR_DISPLAY_OFFSET_MS = 6 * 60 * 60 * 1000;

/** Align scheduled API instants so FullCalendar and Date getters match México wall clock. */
export function shiftCalendarApiInstantForFullCalendar(value) {
  if (value == null || value === "") return value;
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
    return value;
  }
  const d = value instanceof Date ? new Date(value.getTime()) : new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return new Date(d.getTime() + CALENDAR_DISPLAY_OFFSET_MS);
}

const DATE_ONLY_PATTERN = /^(\d{4}-\d{2}-\d{2})/;

/** Hour:minute in the user's local TZ (use after shiftCalendarApiInstantForFullCalendar for API-derived datetimes). */
export const getStartHour = (timestamp) => {
  if (timestamp == null) return "";
  const base =
    timestamp instanceof Date ? new Date(timestamp.getTime()) : new Date(timestamp);
  if (Number.isNaN(base.getTime())) return "";
  const h = base.getHours();
  const m = base.getMinutes();
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

// ─── internal helpers ─────────────────────────────────────────────────────────

function capitalizeEs(word) {
  if (!word) return word;
  const w = word.trim();
  return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
}

function isDateOnlyString(value) {
  if (value == null || value === "" || value instanceof Date) return false;
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value).trim());
}

const DAY_NAME_TO_UTC = {
  Domingo: 0,
  Lunes: 1,
  Martes: 2,
  "Miércoles": 3,
  Jueves: 4,
  Viernes: 5,
  "Sábado": 6,
};

function countScheduledDaysInRange(start, end, scheduledDays) {
  const t0 = new Date(start);
  const t1 = new Date(end);
  const a = Date.UTC(t0.getUTCFullYear(), t0.getUTCMonth(), t0.getUTCDate());
  const b = Date.UTC(t1.getUTCFullYear(), t1.getUTCMonth(), t1.getUTCDate());
  if (a > b) return 0;
  const daySet = new Set(scheduledDays);
  let count = 0;
  for (let ms = a; ms <= b; ms += 864e5) {
    if (daySet.has(new Date(ms).getUTCDay())) count++;
  }
  return count;
}

function countWorkdayHours(workday) {
  if (!workday.start || !workday.end) return 0;
  return new Date(workday.end).getHours() - new Date(workday.start).getHours();
}

// ─── date-only strings (filters + absence ranges) ───────────────────────────

export const normalizeDateOnly = (value) => {
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

// ─── coercion ─────────────────────────────────────────────────────────────────

/** ISO string, Date, or YYYY-MM-DD (anchored UTC noon). */
export function coerceEventDateInput(value) {
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

// ─── FullCalendar modal row formatters ───────────────────────────────────────

/** Día en rejilla: “Jueves 30 de Abril 2026” (zona México sobre el instante). */
export function formatEventCalendarDate(value) {
  if (!value) return "—";
  const d = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(d.getTime())) return "—";
  const weekday = capitalizeEs(
    new Intl.DateTimeFormat("es-MX", { weekday: "long", timeZone: MEXICO_TZ }).format(d),
  );
  const dayNum = new Intl.DateTimeFormat("es-MX", { day: "numeric", timeZone: MEXICO_TZ }).format(d);
  const month = capitalizeEs(
    new Intl.DateTimeFormat("es-MX", { month: "long", timeZone: MEXICO_TZ }).format(d),
  );
  const year = new Intl.DateTimeFormat("es-MX", { year: "numeric", timeZone: MEXICO_TZ }).format(d);
  return `${weekday} ${dayNum} de ${month} ${year}`;
}

/** Inicio/fil en zona México (usa el instante UTC ya normalizado en el cliente). */
export function formatEventDateTime(value) {
  if (!value) return "—";
  const raw = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(raw.getTime())) return "—";
  const dayNum = new Intl.DateTimeFormat("es-MX", { day: "numeric", timeZone: MEXICO_TZ }).format(
    raw,
  );
  const month = capitalizeEs(
    new Intl.DateTimeFormat("es-MX", { month: "long", timeZone: MEXICO_TZ }).format(raw),
  );
  const timeRaw = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: MEXICO_TZ,
  }).format(raw);
  return `${dayNum} de ${month}, ${timeRaw.toLowerCase().replace(/\s/g, "")}`;
}

// ─── empleado / tests: México estable (usa coerceEventDateInput) ─────────────

/** p.ej. “Martes 5 de Mayo 2026”. */
export function formatMexicoLongWeekdayCalendarDate(value) {
  const d0 = coerceEventDateInput(value);
  if (!d0) return "—";
  const dateOnly = isDateOnlyString(value);
  const d = dateOnly ? new Date(d0.getTime() + CALENDAR_DISPLAY_OFFSET_MS) : d0;
  const tz = dateOnly ? "UTC" : MEXICO_TZ;
  const weekday = capitalizeEs(
    new Intl.DateTimeFormat("es-MX", { weekday: "long", timeZone: tz }).format(d),
  );
  const dayNum = new Intl.DateTimeFormat("es-MX", { day: "numeric", timeZone: tz }).format(d);
  const month = capitalizeEs(
    new Intl.DateTimeFormat("es-MX", { month: "long", timeZone: tz }).format(d),
  );
  const year = new Intl.DateTimeFormat("es-MX", { year: "numeric", timeZone: tz }).format(d);
  return `${weekday} ${dayNum} de ${month} ${year}`;
}

/** p.ej. “1 de Mayo, 3:00pm”. */
export function formatMexicoDayMonthCommaTime12h(value) {
  const d0 = coerceEventDateInput(value);
  if (!d0) return "—";
  const dateOnly = isDateOnlyString(value);
  const d = dateOnly ? new Date(d0.getTime() + CALENDAR_DISPLAY_OFFSET_MS) : d0;
  const tz = dateOnly ? "UTC" : MEXICO_TZ;
  const dayNum = new Intl.DateTimeFormat("es-MX", { day: "numeric", timeZone: tz }).format(d);
  const month = capitalizeEs(
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

export function parseUTCDateToHours(isoString) {
  if (!isoString) return "N/A";
  const d = new Date(isoString);
  const h = String(d.getUTCHours()).padStart(2, "0");
  const m = String(d.getUTCMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

export function totalWorkDaysFromApprovedVacationRequests(vacationRequests, employeeWorkdays) {
  if (!Array.isArray(vacationRequests)) return 0;
  const scheduledDays =
    Array.isArray(employeeWorkdays) && employeeWorkdays.length > 0
      ? employeeWorkdays.map((w) => DAY_NAME_TO_UTC[w.name]).filter((d) => d !== undefined)
      : [1, 2, 3, 4, 5];
  return vacationRequests
    .filter((r) => r.status === 1)
    .reduce((sum, r) => sum + countScheduledDaysInRange(r.start, r.end, scheduledDays), 0);
}

export function countWorkdayDays(workdays) {
  if (!Array.isArray(workdays)) return 0;
  return workdays.length;
}

export function countWorkdaysHours(workdays) {
  if (!Array.isArray(workdays)) return 0;
  return workdays.reduce((prev, curr) => prev + countWorkdayHours(curr), 0);
}

/** Ausencias: fechas solo-día con es-MX largo. */
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
