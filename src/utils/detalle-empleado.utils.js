import { getScheduledWeekdayNumbers, getShiftDurationMinutes } from "./employeeShifts";

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

export function totalWorkDaysFromApprovedVacationRequests(vacationRequests, employeeShifts) {
  if (!Array.isArray(vacationRequests)) return 0;

  const scheduledDays =
    Array.isArray(employeeShifts) && employeeShifts.length > 0
      ? getScheduledWeekdayNumbers(employeeShifts)
      : [1, 2, 3, 4, 5];

  return vacationRequests
    .filter((r) => r.status === 1)
    .reduce((sum, r) => sum + countScheduledDaysInRange(r.start, r.end, scheduledDays), 0);
}

export function countScheduledDays(shifts) {
  return getScheduledWeekdayNumbers(shifts).length;
}

export function countShiftsHours(shifts) {
  if (!Array.isArray(shifts)) return 0;

  const totalHours = shifts.reduce(
    (sum, shift) => sum + (getShiftDurationMinutes(shift) / 60),
    0,
  );

  return Number.isInteger(totalHours) ? totalHours : Number(totalHours.toFixed(1));
}

/** @deprecated use countScheduledDays */
export function countWorkdayDays(shifts) {
  return countScheduledDays(shifts);
}

/** @deprecated use countShiftsHours */
export function countWorkdaysHours(shifts) {
  return countShiftsHours(shifts);
}

export function parseUTCDateToHours(isoString) {
  if (!isoString) return "N/A";

  if (typeof isoString === "string" && /^\d{2}:\d{2}$/.test(isoString)) {
    return isoString;
  }

  const d = new Date(isoString);
  const h = String(d.getUTCHours()).padStart(2, "0");
  const m = String(d.getUTCMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}
