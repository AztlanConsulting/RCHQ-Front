import {
  countScheduledDays,
  countShiftsHours,
  getScheduledWeekdayNumbers,
  groupShiftsByStartDay,
  shiftsConflict,
  findShiftConflictMessage,
  findDefaultShiftSlot,
  createEmptyShift,
} from "../../utils/employeeShifts";

const LUNES_ID = "wd-lunes";

describe("employeeShifts front utils", () => {
  it("cuenta días laborables únicos con Regla A", () => {
    const shifts = [
      {
        startWorkdayName: "Martes",
        endWorkdayName: "Martes",
        start: "15:00",
        end: "17:00",
      },
      {
        startWorkdayName: "Martes",
        endWorkdayName: "Martes",
        start: "20:00",
        end: "23:00",
      },
    ];

    expect(countScheduledDays(shifts)).toBe(1);
    expect(getScheduledWeekdayNumbers(shifts)).toEqual([2]);
  });

  it("suma horas semanales de múltiples turnos", () => {
    const shifts = [
      {
        startWorkdayName: "Lunes",
        endWorkdayName: "Lunes",
        start: "09:00",
        end: "13:00",
      },
      {
        startWorkdayName: "Lunes",
        endWorkdayName: "Lunes",
        start: "15:00",
        end: "19:00",
      },
    ];

    expect(countShiftsHours(shifts)).toBe(8);
  });

  it("agrupa turnos por día de inicio", () => {
    const grouped = groupShiftsByStartDay([
      {
        shiftId: "1",
        startWorkdayName: "Martes",
        endWorkdayName: "Martes",
        start: "09:00",
        end: "12:00",
      },
      {
        shiftId: "2",
        startWorkdayName: "Lunes",
        endWorkdayName: "Martes",
        start: "22:00",
        end: "04:00",
      },
    ]);

    expect(grouped.map((group) => group.dayName)).toEqual(["Lunes", "Martes"]);
    expect(grouped[0].shifts).toHaveLength(1);
    expect(grouped[1].shifts).toHaveLength(1);
  });

  it("detecta turnos duplicados exactos", () => {
    const shift = {
      startWorkdayId: LUNES_ID,
      endWorkdayId: LUNES_ID,
      start: "08:00",
      end: "17:00",
      allDay: false,
    };

    expect(shiftsConflict(shift, { ...shift })).toBe(true);
    expect(findShiftConflictMessage([shift, { ...shift }])).toMatch(/repetir el mismo turno/i);
  });

  it("sugiere la siguiente hora libre en el mismo día", () => {
    const catalog = [{ workdayId: LUNES_ID, name: "Lunes" }];
    const existing = [{
      startWorkdayId: LUNES_ID,
      endWorkdayId: LUNES_ID,
      start: "08:00",
      end: "17:00",
      allDay: false,
    }];

    expect(findDefaultShiftSlot(existing, catalog)).toEqual({
      startWorkdayId: LUNES_ID,
      endWorkdayId: LUNES_ID,
      start: "05:00",
      end: "06:00",
      allDay: false,
    });

    const newShift = createEmptyShift(catalog, existing);
    expect(newShift.start).toBe("05:00");
    expect(newShift.end).toBe("06:00");
  });
});
