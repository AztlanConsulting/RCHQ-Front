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

export const createEmptyShift = (workdayCatalog = []) => {
  const defaultDay = workdayCatalog[0] ?? {};
  const workdayId = defaultDay.workdayId ?? defaultDay.workday_id ?? "";

  return {
    clientId: crypto.randomUUID(),
    startWorkdayId: workdayId,
    endWorkdayId: workdayId,
    start: "08:00",
    end: "17:00",
    allDay: false,
  };
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
