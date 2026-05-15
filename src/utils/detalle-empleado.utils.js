const DAY_NAME_TO_UTC = {
    Domingo: 0,
    Lunes: 1,
    Martes: 2,
    Miércoles: 3,
    Jueves: 4,
    Viernes: 5,
    Sábado: 6,
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
export function totalWorkDaysFromApprovedVacationRequests(
    vacationRequests,
    employeeWorkdays,
) {
    if (!Array.isArray(vacationRequests)) return 0;

    const scheduledDays =
        Array.isArray(employeeWorkdays) && employeeWorkdays.length > 0
            ? employeeWorkdays
                  .map((w) => DAY_NAME_TO_UTC[w.name])
                  .filter((d) => d !== undefined)
            : [1, 2, 3, 4, 5];

    return vacationRequests
        .filter((r) => r.status === 1)
        .reduce(
            (sum, r) =>
                sum + countScheduledDaysInRange(r.start, r.end, scheduledDays),
            0,
        );
}

function countWorkdayHours(workday) {
    if (!workday.start || !workday.end) return 0;

    return (
        new Date(workday.end).getHours() - new Date(workday.start).getHours()
    );
    // start/end format: 1970-01-01T08:00:00.000Z
}

// input: "1970-01-01T08:00:00.000Z"
// output: "08:00"
export function parseUTCDateToHours(isoString) {
    if (!isoString) return "N/A";
    const d = new Date(isoString);
    const h = String(d.getUTCHours()).padStart(2, "0");
    const m = String(d.getUTCMinutes()).padStart(2, "0");
    return `${h}:${m}`;
}

export function countWorkdayDays(workdays) {
    if (!Array.isArray(workdays)) return 0;

    return workdays.length;
}

export function countWorkdaysHours(workdays) {
    if (!Array.isArray(workdays)) return 0;

    return workdays.reduce((prev, curr) => prev + countWorkdayHours(curr), 0);
}
