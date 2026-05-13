const DAY_NAME_TO_UTC = {
  Domingo: 0,
  Lunes: 1,
  Martes: 2,
  "Miércoles": 3,
  Jueves: 4,
  Viernes: 5,
  "Sábado": 6,
};

/**
 * Counts days in [start, end] whose UTC weekday is in scheduledDays.
 * Inclusive. Uses UTC date parts to match API ISO strings (e.g. ...Z).
 */
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

/**
 * Sum of scheduled workdays used across all approved vacation requests.
 * Falls back to Mon–Fri if employeeWorkdays is not provided.
 */
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

function countWorkdayHours(workday) {
  if (!workday.start || !workday.end) return 0;

  return new Date(workday.end).getHours() - new Date(workday.start).getHours();
  // start/end format: 1970-01-01T08:00:00.000Z
}

/** IANA zone for calendar / detalle copy (same instant parsing as {@link parseUTCDateToHours}). */
export const MEXICO_TIME_ZONE = "America/Mexico_City";

function capitalizeEsWord(word) {
  if (!word) return word;
  const w = word.trim();
  return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
}

/**
 * Same entry point as parseUTCDateToHours: `new Date(value)`.
 * Supports ISO strings, Date, and calendar-only `YYYY-MM-DD` (interpreted with stable noon UTC).
 */
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

// input: "1970-01-01T08:00:00.000Z"
// output: "08:00" (UTC clock — horarios de jornada en tarjetas de empleado)
export function parseUTCDateToHours(isoString) {
  if (!isoString) return "N/A";
  const d = new Date(isoString);
  const h = String(d.getUTCHours()).padStart(2, "0");
  const m = String(d.getUTCMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

/**
 * e.g. "Martes 5 de Mayo 2026" — fecha de calendario en zona México.
 */
export function formatMexicoLongWeekdayCalendarDate(value) {
  const d = coerceEventDateInput(value);
  if (!d) return "—";
  const tz = MEXICO_TIME_ZONE;
  const weekday = capitalizeEsWord(
    new Intl.DateTimeFormat("es-MX", { weekday: "long", timeZone: tz }).format(d),
  );
  const dayNum = new Intl.DateTimeFormat("es-MX", { day: "numeric", timeZone: tz }).format(d);
  const month = capitalizeEsWord(
    new Intl.DateTimeFormat("es-MX", { month: "long", timeZone: tz }).format(d),
  );
  const year = new Intl.DateTimeFormat("es-MX", { year: "numeric", timeZone: tz }).format(d);
  return `${weekday} ${dayNum} de ${month} ${year}`;
}

/**
 * e.g. "1 de Mayo, 3:00pm" — día + mes en México e instante en hora local México (12h).
 * Misma base que {@link parseUTCDateToHours}: `new Date(value)`.
 */
export function formatMexicoDayMonthCommaTime12h(value) {
  const d = coerceEventDateInput(value);
  if (!d) return "—";
  const tz = MEXICO_TIME_ZONE;
  const dayNum = new Intl.DateTimeFormat("es-MX", { day: "numeric", timeZone: tz }).format(d);
  const month = capitalizeEsWord(
    new Intl.DateTimeFormat("es-MX", { month: "long", timeZone: tz }).format(d),
  );
  const timeRaw = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: tz,
  }).format(d);
  const timeCompact = timeRaw.toLowerCase().replace(/\s/g, "");

  return `${dayNum} de ${month}, ${timeCompact}`;
}

export function countWorkdayDays(workdays) {
  if (!Array.isArray(workdays)) return 0;

  return workdays.length;
}

export function countWorkdaysHours(workdays) {
  if (!Array.isArray(workdays)) return 0;

  return workdays.reduce((prev, curr) => prev + countWorkdayHours(curr), 0);
}