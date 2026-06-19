import {
  countScheduledDays,
  countShiftsHours,
  getScheduledWeekdayNumbers,
  groupShiftsByStartDay,
} from "../../utils/employeeShifts";

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
});
