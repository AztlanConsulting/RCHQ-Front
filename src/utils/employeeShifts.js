const DAY_NAME_TO_UTC = {
  Domingo: 0,
  Lunes: 1,
  Martes: 2,
  "Miércoles": 3,
  Jueves: 4,
  Viernes: 5,
  "Sábado": 6,
};

const WORKDAY_ORDER = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

export const MIN_SHIFT_MINUTES = 60;
export const MAX_SHIFT_MINUTES = 24 * 60;

const parseTimeToMinutes = (time) => {
  if (!time) return 0;

  if (time instanceof Date) {
    return (time.getUTCHours() * 60) + time.getUTCMinutes();
  }

  const match = String(time).match(/(\d{2}):(\d{2})/);
  if (!match) return 0;

  return (Number(match[1]) * 60) + Number(match[2]);
};

const getWorkdayName = (shift, kind) => {
  if (kind === "start") {
    return shift.startWorkdayName ?? shift.start_workday?.name ?? shift.name ?? "";
  }

  return shift.endWorkdayName ?? shift.end_workday?.name ?? shift.name ?? "";
};

export const getShiftDurationMinutes = (shift) => {
  if (shift?.allDay || shift?.is_all_day) {
    return MAX_SHIFT_MINUTES;
  }

  const startMinutes = parseTimeToMinutes(shift.start);
  const endMinutes = parseTimeToMinutes(shift.end);
  const startWorkdayName = getWorkdayName(shift, "start");
  const endWorkdayName = getWorkdayName(shift, "end");

  if (startWorkdayName !== endWorkdayName) {
    return (MAX_SHIFT_MINUTES - startMinutes) + endMinutes;
  }

  if (endMinutes <= startMinutes) {
    return (MAX_SHIFT_MINUTES - startMinutes) + endMinutes;
  }

  return endMinutes - startMinutes;
};

export const getScheduledWeekdayNumbers = (shifts = []) => {
  const weekdays = new Set();

  shifts.forEach((shift) => {
    const startDay = DAY_NAME_TO_UTC[getWorkdayName(shift, "start")];
    const endDay = DAY_NAME_TO_UTC[getWorkdayName(shift, "end")];

    if (startDay !== undefined) weekdays.add(startDay);
    if (endDay !== undefined) weekdays.add(endDay);
  });

  return [...weekdays].sort((a, b) => a - b);
};

export const countScheduledDays = (shifts) => getScheduledWeekdayNumbers(shifts).length;

export const countShiftsHours = (shifts) => {
  if (!Array.isArray(shifts)) return 0;

  const totalHours = shifts.reduce(
    (sum, shift) => sum + (getShiftDurationMinutes(shift) / 60),
    0,
  );

  return Number.isInteger(totalHours) ? totalHours : Number(totalHours.toFixed(1));
};

export const formatShiftTimeRange = (shift, formatTime = (value) => value) => {
  const start = formatTime(shift.start);
  const end = formatTime(shift.end);
  const startDay = getWorkdayName(shift, "start");
  const endDay = getWorkdayName(shift, "end");

  if (startDay && endDay && startDay !== endDay) {
    return `${start} – ${end} (${endDay})`;
  }

  return `${start} – ${end}`;
};

export const groupShiftsByStartDay = (shifts = []) => {
  const grouped = new Map();

  shifts.forEach((shift) => {
    const dayName = getWorkdayName(shift, "start") || "Sin día";
    if (!grouped.has(dayName)) {
      grouped.set(dayName, []);
    }
    grouped.get(dayName).push(shift);
  });

  return WORKDAY_ORDER
    .filter((dayName) => grouped.has(dayName))
    .map((dayName) => ({
      dayName,
      shifts: grouped.get(dayName),
    }));
};

export const mapShiftFromApi = (shift) => ({
  clientId: shift.shiftId ?? crypto.randomUUID(),
  startWorkdayId: shift.startWorkdayId,
  endWorkdayId: shift.endWorkdayId,
  startWorkdayName: shift.startWorkdayName,
  endWorkdayName: shift.endWorkdayName,
  start: shift.start ?? "08:00",
  end: shift.end ?? "17:00",
  allDay: Boolean(shift.allDay),
});

export const validateShiftDuration = (shift) => {
  const duration = getShiftDurationMinutes(shift);

  if (duration < MIN_SHIFT_MINUTES) {
    return "Cada turno debe durar al menos 1 hora.";
  }

  if (duration > MAX_SHIFT_MINUTES) {
    return "Cada turno no puede durar más de 24 horas.";
  }

  return "";
};

export const normalizeShiftForComparison = (shift) => {
  const allDay = Boolean(shift?.allDay ?? shift?.is_all_day);
  const formatTime = (time) => {
    if (allDay) return "00:00";
    const match = String(time ?? "").match(/(\d{2}):(\d{2})/);
    return match ? `${match[1]}:${match[2]}` : "";
  };

  return {
    startWorkdayId: String(shift?.startWorkdayId ?? shift?.start_workday_id ?? ""),
    endWorkdayId: String(shift?.endWorkdayId ?? shift?.end_workday_id ?? ""),
    start: formatTime(shift?.start),
    end: formatTime(shift?.end),
    allDay,
  };
};

export const getShiftSignature = (shift) => {
  const normalized = normalizeShiftForComparison(shift);
  return [
    normalized.startWorkdayId,
    normalized.endWorkdayId,
    normalized.start,
    normalized.end,
    normalized.allDay,
  ].join("|");
};

const getTimeSegments = (shift) => {
  const normalized = normalizeShiftForComparison(shift);

  if (normalized.allDay) {
    return [[0, MAX_SHIFT_MINUTES]];
  }

  const start = parseTimeToMinutes(normalized.start);
  const end = parseTimeToMinutes(normalized.end);

  if (normalized.startWorkdayId === normalized.endWorkdayId && end <= start) {
    return [[start, MAX_SHIFT_MINUTES], [0, end]];
  }

  return [[start, end]];
};

const segmentsOverlap = (segmentsA, segmentsB) => {
  for (const [aStart, aEnd] of segmentsA) {
    for (const [bStart, bEnd] of segmentsB) {
      if (aStart < bEnd && bStart < aEnd) {
        return true;
      }
    }
  }
  return false;
};

export const shiftsConflict = (shiftA, shiftB) => {
  if (getShiftSignature(shiftA) === getShiftSignature(shiftB)) {
    return true;
  }

  const a = normalizeShiftForComparison(shiftA);
  const b = normalizeShiftForComparison(shiftB);

  if (a.startWorkdayId !== a.endWorkdayId || b.startWorkdayId !== b.endWorkdayId) {
    return false;
  }

  if (a.startWorkdayId !== b.startWorkdayId) {
    return false;
  }

  return segmentsOverlap(getTimeSegments(shiftA), getTimeSegments(shiftB));
};

const getWorkdayLabel = (workdayId, catalog = []) => {
  const match = catalog.find(
    (day) => String(day.workdayId ?? day.workday_id) === String(workdayId),
  );
  return match?.name ?? "turno";
};

const describeShift = (shift, catalog = []) => {
  const normalized = normalizeShiftForComparison(shift);
  const dayName = getWorkdayLabel(normalized.startWorkdayId, catalog);

  if (normalized.allDay) {
    return `${dayName} (24 horas)`;
  }

  if (normalized.startWorkdayId !== normalized.endWorkdayId) {
    const endDayName = getWorkdayLabel(normalized.endWorkdayId, catalog);
    return `${dayName} ${normalized.start}–${normalized.end} (${endDayName})`;
  }

  return `${dayName} ${normalized.start}–${normalized.end}`;
};

export const findShiftConflictMessage = (shifts = [], workdayCatalog = []) => {
  for (let i = 0; i < shifts.length; i += 1) {
    for (let j = i + 1; j < shifts.length; j += 1) {
      if (!shiftsConflict(shifts[i], shifts[j])) {
        continue;
      }

      if (getShiftSignature(shifts[i]) === getShiftSignature(shifts[j])) {
        return `No puedes repetir el mismo turno (${describeShift(shifts[i], workdayCatalog)}).`;
      }

      return `Hay turnos que se solapan el ${describeShift(shifts[i], workdayCatalog)}.`;
    }
  }

  return null;
};

const formatMinutesAsTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
};

const buildSameDayCandidate = (workdayId, start, end) => ({
  startWorkdayId: workdayId,
  endWorkdayId: workdayId,
  start,
  end,
  allDay: false,
});

export const findDefaultShiftSlot = (existingShifts = [], workdayCatalog = []) => {
  const days = workdayCatalog.length > 0 ? workdayCatalog : [{}];

  for (const day of days) {
    const workdayId = day.workdayId ?? day.workday_id ?? "";
    const dayCandidates = [
      buildSameDayCandidate(workdayId, "08:00", "17:00"),
    ];

    for (let startMin = 5 * 60; startMin <= (23 * 60) - MIN_SHIFT_MINUTES; startMin += 60) {
      dayCandidates.push(
        buildSameDayCandidate(
          workdayId,
          formatMinutesAsTime(startMin),
          formatMinutesAsTime(startMin + MIN_SHIFT_MINUTES),
        ),
      );
    }

    for (const candidate of dayCandidates) {
      const hasConflict = existingShifts.some(
        (existing) => shiftsConflict(candidate, existing),
      );
      if (!hasConflict) {
        return candidate;
      }
    }
  }

  const fallbackDay = days[0];
  const fallbackId = fallbackDay.workdayId ?? fallbackDay.workday_id ?? "";
  return buildSameDayCandidate(fallbackId, "08:00", "17:00");
};

export const createEmptyShift = (workdayCatalog = [], existingShifts = []) => ({
  clientId: crypto.randomUUID(),
  ...findDefaultShiftSlot(existingShifts, workdayCatalog),
});

export const findConflictingShiftClientIds = (shifts = []) => {
  const conflicting = new Set();

  for (let i = 0; i < shifts.length; i += 1) {
    for (let j = i + 1; j < shifts.length; j += 1) {
      if (!shiftsConflict(shifts[i], shifts[j])) {
        continue;
      }

      if (shifts[i].clientId) conflicting.add(shifts[i].clientId);
      if (shifts[j].clientId) conflicting.add(shifts[j].clientId);
    }
  }

  return conflicting;
};

export const buildShiftPayload = (shift, workdayCatalog = []) => {
  const startDay = workdayCatalog.find(
    (day) => String(day.workdayId ?? day.workday_id) === String(shift.startWorkdayId),
  );
  const endDay = workdayCatalog.find(
    (day) => String(day.workdayId ?? day.workday_id) === String(shift.endWorkdayId),
  );
  const label = startDay?.name ?? shift.startWorkdayName ?? "turno";
  const allDay = Boolean(shift.allDay);
  const start = allDay ? "00:00" : shift.start;
  const end = allDay ? "00:00" : shift.end;

  if (!start || !end) {
    throw new Error(`Debes asignar un horario completo para ${label}.`);
  }

  const durationError = validateShiftDuration({
    ...shift,
    start,
    end,
    allDay,
    startWorkdayName: startDay?.name ?? shift.startWorkdayName,
    endWorkdayName: endDay?.name ?? shift.endWorkdayName,
  });

  if (durationError) {
    throw new Error(`El turno del ${label}: ${durationError}`);
  }

  return {
    startWorkdayId: shift.startWorkdayId,
    endWorkdayId: shift.endWorkdayId,
    start,
    end,
    allDay,
  };
};
export { DAY_NAME_TO_UTC };
