// ─── shared constants ─────────────────────────────────────────────────────────

const MEXICO_TZ = "America/Mexico_City";

// API stores workday/schedule times in local Mexico time labeled as UTC.
// FullCalendar converts those UTC timestamps to local (UTC-6), shifting them 6h
// behind. Add this offset to recover the original displayed time.
export const CALENDAR_DISPLAY_OFFSET_MS = 6 * 60 * 60 * 1000;

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
  // start/end format: "1970-01-01T08:00:00.000Z"
  return new Date(workday.end).getHours() - new Date(workday.start).getHours();
}

// ─── coercion ─────────────────────────────────────────────────────────────────

// input:  ISO string, Date, or "YYYY-MM-DD"
// output: Date (YYYY-MM-DD is anchored at UTC noon for stability), or null
export function coerceEventDateInput(value) {
  if (value == null || value === "") return null;
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
  const s = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const [y, mo, d] = s.split("-").map(Number);
    return new Date(Date.UTC(y, mo - 1, d, 12, 0, 0));
  }
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

// ─── calendar display formatters ──────────────────────────────────────────────

// input:  "2026-05-01T00:00:00.000Z"  (UTC midnight from API)
// output: "Jueves 30 de Abril 2026"   (Mexico City local date — midnight UTC = April 30 at 6pm CST)
export function formatEventCalendarDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "—";
  const weekday = capitalizeEs(
    new Intl.DateTimeFormat("es-MX", { weekday: "long", timeZone: MEXICO_TZ }).format(d),
  );
  const day = new Intl.DateTimeFormat("es-MX", { day: "numeric", timeZone: MEXICO_TZ }).format(d);
  const month = capitalizeEs(
    new Intl.DateTimeFormat("es-MX", { month: "long", timeZone: MEXICO_TZ }).format(d),
  );
  const year = new Intl.DateTimeFormat("es-MX", { year: "numeric", timeZone: MEXICO_TZ }).format(d);
  return `${weekday} ${day} de ${month} ${year}`;
}

// input:  FullCalendar Date like Fri May 01 2026 11:00:00 GMT-0600
//         (FullCalendar shifts API UTC times to local, placing them 6h behind the stored value)
// output: "1 de Mayo, 5:00pm"  (recovers the real local time by adding the 6h back)
export function formatEventDateTime(value) {
  if (!value) return "—";
  const raw = value instanceof Date ? value : new Date(String(value));
  if (isNaN(raw.getTime())) return "—";
  const d = new Date(raw.getTime() + CALENDAR_DISPLAY_OFFSET_MS);
  const day = new Intl.DateTimeFormat("es-MX", { day: "numeric", timeZone: MEXICO_TZ }).format(d);
  const month = capitalizeEs(
    new Intl.DateTimeFormat("es-MX", { month: "long", timeZone: MEXICO_TZ }).format(d),
  );
  const timeRaw = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: MEXICO_TZ,
  }).format(d);
  return `${day} de ${month}, ${timeRaw.toLowerCase().replace(/\s/g, "")}`;
}

// ─── kept for backward-compat (used in tests and employeeAdminCard) ───────────

// input:  "YYYY-MM-DD" or ISO string or Date
// output: "Domingo 3 de Mayo 2026"
//   - YYYY-MM-DD: treated as literal calendar date (UTC noon anchor, +6h, UTC format)
//   - ISO/Date:   formatted in Mexico City tz without extra offset
export function formatMexicoLongWeekdayCalendarDate(value) {
  const d0 = coerceEventDateInput(value);
  if (!d0) return "—";
  const dateOnly = isDateOnlyString(value);
  const d = dateOnly ? new Date(d0.getTime() + CALENDAR_DISPLAY_OFFSET_MS) : d0;
  const tz = dateOnly ? "UTC" : MEXICO_TZ;
  const weekday = capitalizeEs(
    new Intl.DateTimeFormat("es-MX", { weekday: "long", timeZone: tz }).format(d),
  );
  const day = new Intl.DateTimeFormat("es-MX", { day: "numeric", timeZone: tz }).format(d);
  const month = capitalizeEs(
    new Intl.DateTimeFormat("es-MX", { month: "long", timeZone: tz }).format(d),
  );
  const year = new Intl.DateTimeFormat("es-MX", { year: "numeric", timeZone: tz }).format(d);
  return `${weekday} ${day} de ${month} ${year}`;
}

// input:  "2026-05-01T10:00:00.000Z"  (10:00 UTC = 4:00am Mexico City)
// output: "1 de Mayo, 4:00am"
export function formatMexicoDayMonthCommaTime12h(value) {
  const d0 = coerceEventDateInput(value);
  if (!d0) return "—";
  const dateOnly = isDateOnlyString(value);
  const d = dateOnly ? new Date(d0.getTime() + CALENDAR_DISPLAY_OFFSET_MS) : d0;
  const tz = dateOnly ? "UTC" : MEXICO_TZ;
  const day = new Intl.DateTimeFormat("es-MX", { day: "numeric", timeZone: tz }).format(d);
  const month = capitalizeEs(
    new Intl.DateTimeFormat("es-MX", { month: "long", timeZone: tz }).format(d),
  );
  const timeRaw = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: tz,
  }).format(d);
  return `${day} de ${month}, ${timeRaw.toLowerCase().replace(/\s/g, "")}`;
}

// ─── workday / schedule helpers ───────────────────────────────────────────────

// input:  "1970-01-01T08:00:00.000Z"
// output: "08:00"  (UTC clock — workday schedule times stored as UTC)
export function parseUTCDateToHours(isoString) {
  if (!isoString) return "N/A";
  const d = new Date(isoString);
  const h = String(d.getUTCHours()).padStart(2, "0");
  const m = String(d.getUTCMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

// input:  array of vacation request objects { status, start, end }, optional workdays array
// output: total scheduled workdays used across all approved (status === 1) requests
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

// input:  array of workday objects
// output: number of workday entries
export function countWorkdayDays(workdays) {
  if (!Array.isArray(workdays)) return 0;
  return workdays.length;
}

// input:  array of workday objects with start/end ISO strings ("1970-01-01T08:00:00.000Z")
// output: total hours across all workdays
export function countWorkdaysHours(workdays) {
  if (!Array.isArray(workdays)) return 0;
  return workdays.reduce((prev, curr) => prev + countWorkdayHours(curr), 0);
}

