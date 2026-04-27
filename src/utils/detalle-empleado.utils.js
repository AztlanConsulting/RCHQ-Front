/**
 * Inclusive. Uses UTC date parts to match API ISO strings (e.g. ...Z).
 */
export function countMonFriInRange(start, end) {
    const t0 = new Date(start);
    const t1 = new Date(end);
    const a = Date.UTC(t0.getUTCFullYear(), t0.getUTCMonth(), t0.getUTCDate());
    const b = Date.UTC(t1.getUTCFullYear(), t1.getUTCMonth(), t1.getUTCDate());
    if (a > b) return 0;
    let count = 0;
    for (let ms = a; ms <= b; ms += 864e5) {
      const d = new Date(ms).getUTCDay(); // 0=Sun .. 5=Fri, 6=Sat
      if (d >= 1 && d <= 5) count += 1;
    }
    return count;
  }
  
  /**
   * Sum of Mon–Fri days across all requests with status === 1.
   */
  export function totalWorkDaysFromApprovedVacationRequests(vacationRequests) {
    if (!Array.isArray(vacationRequests)) return 0;
    return vacationRequests
      .filter((r) => r.status === 1)
      .reduce((sum, r) => sum + countMonFriInRange(r.start, r.end), 0);
  }