import SelectField from "../atoms/selectField";
import TimeField from "../atoms/timeField";
import CheckboxField from "../atoms/checkboxField";
import SmallButton from "../atoms/smallButton";
import Type from "../atoms/type";
import {
  countScheduledDays,
  countShiftsHours,
  findConflictingShiftClientIds,
} from "@/utils/employeeShifts";

const EmployeeShiftList = ({
  shifts = [],
  workdayCatalog = [],
  onAddShift,
  onRemoveShift,
  onUpdateShiftField,
  error,
}) => {
  const workdayOptions = workdayCatalog.map((day) => ({
    value: day.workdayId ?? day.workday_id,
    label: day.name,
  }));
  const conflictingShiftIds = findConflictingShiftClientIds(shifts);

  return (
    <div>
      <Type variant="metric-label" as="p" className="mb-2">
        Turnos de trabajo
      </Type>

      <div className="flex flex-col gap-3">
        {shifts.map((shift) => {
          const hasConflict = conflictingShiftIds.has(shift.clientId);

          return (
          <div
            key={shift.clientId}
            className={`rounded-lg border px-3 py-3 ${
              hasConflict
                ? "border-red-300 bg-red-50"
                : "border-slate-200 bg-slate-50"
            }`}
          >
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto] lg:items-center">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:items-end">
                <SelectField
                  label="Día inicio"
                  id={`shift-start-day-${shift.clientId}`}
                  value={shift.startWorkdayId}
                  onChange={(e) => onUpdateShiftField(shift.clientId, "startWorkdayId", e.target.value)}
                  options={workdayOptions}
                  placeholder="Día"
                  labelColor="text-slate-500"
                />
                <TimeField
                  label="Hora inicio"
                  value={shift.start}
                  onChange={(value) => onUpdateShiftField(shift.clientId, "start", value)}
                  placeholder="--:--"
                  stepMinutes={30}
                  disabled={shift.allDay}
                />
              </div>

              <span className="hidden text-center text-slate-400 lg:block">→</span>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:items-end">
                <SelectField
                  label="Día fin"
                  id={`shift-end-day-${shift.clientId}`}
                  value={shift.endWorkdayId}
                  onChange={(e) => onUpdateShiftField(shift.clientId, "endWorkdayId", e.target.value)}
                  options={workdayOptions}
                  placeholder="Día"
                  labelColor="text-slate-500"
                />
                <TimeField
                  label="Hora fin"
                  value={shift.end}
                  onChange={(value) => onUpdateShiftField(shift.clientId, "end", value)}
                  minTime={shift.startWorkdayId === shift.endWorkdayId ? shift.start : undefined}
                  placeholder="--:--"
                  stepMinutes={30}
                  disabled={shift.allDay}
                />
              </div>

              <div className="flex items-end justify-end">
                <SmallButton
                  type="button"
                  text="Eliminar"
                  hasNoRollback
                  onClick={() => onRemoveShift(shift.clientId)}
                  disabled={shifts.length <= 1}
                />
              </div>
            </div>

            <div className="mt-3">
              <CheckboxField
                id={`all-day-shift-${shift.clientId}`}
                label="Turno de 24 horas"
                checked={Boolean(shift.allDay)}
                onChange={(checked) => onUpdateShiftField(shift.clientId, "allDay", checked)}
              />
            </div>
          </div>
          );
        })}
      </div>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <SmallButton type="button" text="+ Agregar turno" cancel onClick={onAddShift} />
        <Type variant="metric-label" as="p" className="text-slate-500">
          {`${countScheduledDays(shifts)} días laborables · ${countShiftsHours(shifts)} h semanales`}
        </Type>
      </div>

      {error && (
        <div className="mt-2">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
};

export default EmployeeShiftList;
