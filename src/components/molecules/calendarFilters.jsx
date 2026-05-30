import FilterGroup from "../atoms/filterGroup";
import SearchableCheckboxDropdown from "./searchableCheckboxDropdown";
import Type from "../atoms/type";

const focusTrailing = (opt) =>
  opt.icon ? (
    <img
      src={`/${opt.icon}.svg`}
      alt=""
      className="h-4 w-4 shrink-0 object-contain brightness-0"
      loading="lazy"
    />
  ) : null;

const scopeTrailing = (opt) =>
  opt.color ? (
    <span
      className="inline-block size-2.5 shrink-0 rounded-full border border-slate-200/30"
      style={{ backgroundColor: opt.color }}
      aria-hidden
    />
  ) : null;

const vacationTrailing = (opt) =>
  opt.color ? (
    <span
      className="inline-block size-2.5 shrink-0 rounded-full border border-slate-200/30"
      style={{ backgroundColor: opt.color }}
      aria-hidden
    />
  ) : null;

const FilterSeparator = ({ emphasis = false, className = "" }) => (
  <div
    className={`border border-b ${
      emphasis ? "border-[#1F3664]" : "border-[#EAEAEA]"
    } ${className}`}
  />
);

const CalendarSwitchGroup = ({
  label,
  options,
  value,
  onChange,
}) => (
  <div className="mt-2">
    <Type variant="metric-label" className="text-sm" as="p">
      {label}
    </Type>
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {options.map((option) => {
        const isActive = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange?.(option.value)}
            className={`flex min-h-11 w-full items-center justify-center rounded-md border px-2.5 py-2 text-center text-xs font-semibold leading-tight transition sm:px-3 sm:text-sm ${
              isActive
                ? "border-transparent bg-[#1F3664] text-white shadow-sm"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  </div>
);

const absenceStatusTrailing = (opt) =>
  opt.color ? (
    <span
      className="inline-block size-2.5 shrink-0 rounded-full border border-slate-200/30"
      style={{ backgroundColor: opt.color }}
      aria-hidden
    />
  ) : null;

const CalendarFilters = ({
  houseName,
  focusFilters,
  setFocusFilters,
  focusOptions,
  scopeFilters,
  setScopeFilters,
  scopeOptions,
  eventTypeFilters,
  setEventTypeFilters,
  eventTypeOptions,
  vacationStatusFilters,
  setVacationStatusFilters,
  vacationStatusOptions,
  absenceTypeFilters,
  setAbsenceTypeFilters,
  absenceTypeOptions,
  employeeFilters,
  filteredEmployeeOptions,
  employeeSearch,
  selectedEmployeeLabel,
  setEmployeeSearch,
  toggleEmployeeValue,
  clearEmployeeSelection,
  resetEmployeeSelection,
  absenceStatusFilters,
  setAbsenceStatusFilters,
  absenceStatusOptions,
  absenceEvidenceFilters,
  setAbsenceEvidenceFilters,
  absenceEvidenceOptions,
  showEventFilters,
  showVacationFilters,
  showAbscenceFilters,
  viewerRole,
  calendarMode = "personal",
  onCalendarModeChange,
  calendarModeOptions = [],
  canSwitchCalendarMode = false,
  calendarTimeZoneMode = "local",
  onCalendarTimeZoneModeChange,
  calendarTimeZoneOptions = [],
  canSwitchCalendarTimeZone = false,
  className = "",
  showPageHeading = true,
  stackMaxHeightClass = "max-h-[calc(100vh-40px)] overflow-scroll",
}) => {
  return (
    <div className={`p-2 flex flex-col gap-1 mb-auto ${stackMaxHeightClass} ${className}`}>
      {showPageHeading ? (
        <Type variant="page-title" as="h2">
          Calendario
        </Type>
      ) : null}
      {houseName && (
        <Type variant="section-title" as="h2" className="mb-2">
          {houseName}
        </Type>
      )}
      {canSwitchCalendarMode ? (
        <CalendarSwitchGroup
          label="CALENDARIO"
          options={calendarModeOptions}
          value={calendarMode}
          onChange={onCalendarModeChange}
        />
      ) : null}
      {canSwitchCalendarTimeZone ? (
        <>
          {canSwitchCalendarMode ? (
            <FilterSeparator className="my-2" />
          ) : null}
          <CalendarSwitchGroup
            label="HORARIO"
            options={calendarTimeZoneOptions}
            value={calendarTimeZoneMode}
            onChange={onCalendarTimeZoneModeChange}
          />
        </>
      ) : null}
      <div className={`flex flex-col gap-4 mt-4`}>
        <FilterGroup
          label="ENFOQUE"
          name="focus"
          options={focusOptions}
          values={focusFilters}
          setValues={setFocusFilters}
          renderTrailing={focusTrailing}
        />
        <FilterSeparator emphasis />
        {viewerRole === "Coordinador" && calendarMode === "house" ? (
          <>
            <SearchableCheckboxDropdown
              label="TRABAJADOR"
              name="employee"
              filteredOptions={filteredEmployeeOptions}
              values={employeeFilters}
              search={employeeSearch}
              selectedLabel={selectedEmployeeLabel}
              onSearchChange={setEmployeeSearch}
              onToggleValue={toggleEmployeeValue}
              onClearSelection={clearEmployeeSelection}
              onResetSelection={resetEmployeeSelection}
            />
            <FilterSeparator />
          </>
        ) : null}
        <div className="flex flex-col gap-4 overflow-y-auto scrollbar-hide">
          <FilterGroup
            label="VISIBILIDAD"
            name="scope"
            options={scopeOptions}
            values={scopeFilters}
            setValues={setScopeFilters}
            renderTrailing={scopeTrailing}
          />
          <FilterSeparator />
          {showEventFilters && (
            <>
              <FilterGroup
                label="CATEGORIA"
                name="tipo-evento"
                options={eventTypeOptions}
                values={eventTypeFilters}
                setValues={setEventTypeFilters}
              />
              <FilterSeparator />
            </>
          )}
          {showVacationFilters && (
            <>
              <FilterGroup
                label="ESTATUS DE VACACIONES"
                name="vacaciones"
                options={vacationStatusOptions}
                values={vacationStatusFilters}
                setValues={setVacationStatusFilters}
                renderTrailing={vacationTrailing}
              />
              <FilterSeparator />
            </>
          )}
          {showAbscenceFilters && (
            <>
              <FilterGroup
                label="TIPO DE AUSENCIA"
                name="absence-type"
                options={absenceTypeOptions}
                values={absenceTypeFilters}
                setValues={setAbsenceTypeFilters}
              />
              <FilterGroup
                label="ESTATUS"
                name="absence-status"
                options={absenceStatusOptions}
                values={absenceStatusFilters}
                setValues={setAbsenceStatusFilters}
                renderTrailing={absenceStatusTrailing}
              />
              <FilterGroup
                label="EVIDENCIA"
                name="absence-evidence"
                options={absenceEvidenceOptions}
                values={absenceEvidenceFilters}
                setValues={setAbsenceEvidenceFilters}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarFilters;
