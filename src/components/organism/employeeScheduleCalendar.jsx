import { useMemo, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/es";
import Type from "../atoms/type";

const REFERENCE_WEEK_START = "2024-01-01";

const WORKDAY_NAME_TO_INDEX = {
  Lunes: 0,
  Martes: 1,
  Miércoles: 2,
  Jueves: 3,
  Viernes: 4,
  Sábado: 5,
  Domingo: 6,
};

const UTC_DAY_TO_NAME = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

const REFERENCE_COLORS = [
  { bg: "#DCEAFE", border: "#1D4ED8", text: "#1E3A8A" },
  { bg: "#DCFCE7", border: "#15803D", text: "#166534" },
  { bg: "#FCE7F3", border: "#BE185D", text: "#9D174D" },
  { bg: "#FEF3C7", border: "#D97706", text: "#B45309" },
  { bg: "#EDE9FE", border: "#7C3AED", text: "#5B21B6" },
];

const buildUtcDateTime = (dayIndex, timeValue) => {
  const hours = Number(String(timeValue).slice(0, 2));
  const minutes = Number(String(timeValue).slice(3, 5));
  return new Date(Date.UTC(2024, 0, 1 + dayIndex, hours, minutes, 0));
};

const getEventDateRange = (dayName, start, end) => {
  const dayIndex = WORKDAY_NAME_TO_INDEX[dayName];
  if (dayIndex === undefined || !start || !end) return null;

  const startDate = buildUtcDateTime(dayIndex, start);
  let endDate = buildUtcDateTime(dayIndex, end);

  if (end <= start) {
    endDate = new Date(endDate.getTime() + 24 * 60 * 60 * 1000);
  }

  return { start: startDate, end: endDate };
};

const formatCalendarTime = (date) => {
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

const getSelectedEvents = (assignedWorkdays) =>
  assignedWorkdays
    .filter((workday) => workday.selected && workday.start && workday.end)
    .map((workday) => {
      const range = getEventDateRange(workday.name, workday.start, workday.end);
      if (!range) return null;

      return {
        id: `assigned-${workday.workdayId}`,
        title: "Asignado",
        start: range.start,
        end: range.end,
        backgroundColor: "#24375e",
        borderColor: "#24375e",
        textColor: "#ffffff",
        extendedProps: {
          kind: "assigned",
          workdayName: workday.name,
        },
      };
    })
    .filter(Boolean);

const getReferenceEvents = (referenceSchedules, visibleReferenceEmployeeIds) =>
  referenceSchedules.flatMap((schedule, index) => {
    if (!visibleReferenceEmployeeIds.includes(schedule.employeeId)) {
      return [];
    }

    const color = REFERENCE_COLORS[index % REFERENCE_COLORS.length];

    return (schedule.workdays ?? [])
      .map((workday) => {
        const start = String(workday.start).slice(11, 16);
        const end = String(workday.end).slice(11, 16);
        const range = getEventDateRange(workday.name, start, end);
        if (!range) return null;

        return {
          id: `reference-${schedule.employeeId}-${workday.workdayId}`,
          title: schedule.name,
          start: range.start,
          end: range.end,
          backgroundColor: color.bg,
          borderColor: color.border,
          textColor: color.text,
          extendedProps: {
            kind: "reference",
          },
        };
      })
      .filter(Boolean);
  });

const ScheduleEventContent = ({ arg }) => (
  <div className="px-1 py-0.5 text-[11px] leading-tight">
    <div className="truncate font-semibold">{arg.event.title}</div>
    {arg.timeText ? <div className="truncate opacity-80">{arg.timeText}</div> : null}
  </div>
);

const EmployeeScheduleCalendar = ({
  assignedWorkdays = [],
  referenceSchedules = [],
  visibleReferenceEmployeeIds = [],
  onToggleReference,
  onCopySchedule,
  onSelectRange,
  onClearDay,
}) => {
  const calendarRef = useRef(null);

  const visibleEvents = useMemo(
    () => [
      ...getReferenceEvents(referenceSchedules, visibleReferenceEmployeeIds),
      ...getSelectedEvents(assignedWorkdays),
    ],
    [assignedWorkdays, referenceSchedules, visibleReferenceEmployeeIds],
  );

  const handleSelection = (info) => {
    const start = info.start;
    const end = info.end;
    const workdayName = UTC_DAY_TO_NAME[start.getUTCDay()];

    calendarRef.current?.getApi()?.unselect();

    if (!workdayName || workdayName === "Domingo" && end <= start) {
      return;
    }

    onSelectRange?.(
      workdayName,
      formatCalendarTime(start),
      formatCalendarTime(end),
    );
  };

  const handleEventClick = (clickInfo) => {
    if (clickInfo.event.extendedProps?.kind !== "assigned") return;
    onClearDay?.(clickInfo.event.extendedProps.workdayName);
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
      <div className="mb-3 flex flex-col gap-1">
        <Type variant="metric-label" as="p">
          Horario semanal
        </Type>
        <p className="text-sm text-slate-500">
          Arrastra sobre la semana para asignar un bloque. Haz click en un bloque asignado para quitarlo.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="rounded-xl bg-[#24375e] p-4 text-white">
          <Type variant="metric-label" as="p" className="text-white/80">
            Visualizar horarios
          </Type>
          <div className="mt-3 flex flex-col gap-2.5">
            {referenceSchedules.length === 0 ? (
              <p className="text-sm text-white/80">
                No hay empleados activos con este rol para usar como referencia.
              </p>
            ) : (
              referenceSchedules.map((schedule, index) => {
                const color = REFERENCE_COLORS[index % REFERENCE_COLORS.length];
                const isVisible = visibleReferenceEmployeeIds.includes(schedule.employeeId);

                return (
                  <div
                    key={schedule.employeeId}
                    className="rounded-lg border border-white/10 bg-white/5 p-2"
                  >
                    <label className="flex cursor-pointer items-start gap-2">
                      <input
                        type="checkbox"
                        checked={isVisible}
                        onChange={() => onToggleReference?.(schedule.employeeId)}
                        className="mt-1 h-4 w-4 rounded border-white/30"
                      />
                      <span className="min-w-0 flex-1">
                        <span
                          className="mb-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold"
                          style={{
                            backgroundColor: color.bg,
                            color: color.text,
                          }}
                        >
                          Referencia
                        </span>
                        <span className="block truncate text-sm font-semibold">
                          {schedule.name}
                        </span>
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() => onCopySchedule?.(schedule.employeeId)}
                      className="mt-2 rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-[#24375e] hover:bg-slate-100"
                    >
                      Copiar horario
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </aside>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <FullCalendar
            ref={calendarRef}
            plugins={[timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            initialDate={REFERENCE_WEEK_START}
            locales={[esLocale]}
            locale="es"
            timeZone="UTC"
            height={620}
            headerToolbar={false}
            allDaySlot={false}
            weekends={true}
            selectable={true}
            selectMirror={true}
            unselectAuto={false}
            slotDuration="00:30:00"
            slotLabelInterval="01:00:00"
            slotMinTime="00:00:00"
            slotMaxTime="24:00:00"
            events={visibleEvents}
            select={handleSelection}
            eventClick={handleEventClick}
            eventContent={(arg) => <ScheduleEventContent arg={arg} />}
            dayHeaderContent={(arg) => UTC_DAY_TO_NAME[arg.date.getUTCDay()]}
          />
        </div>
      </div>
    </div>
  );
};

export default EmployeeScheduleCalendar;
