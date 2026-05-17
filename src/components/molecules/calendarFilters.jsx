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
      className="inline-block size-2.5 shrink-0 rounded-full border border-slate-200"
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
  absenceEmployeeFilters,
  filteredAbsenceEmployeeOptions,
  absenceEmployeeSearch,
  selectedAbsenceEmployeeLabel,
  setAbsenceEmployeeSearch,
  toggleAbsenceEmployeeValue,
  clearAbsenceEmployeeSelection,
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
  className = "",
  showPageHeading = true,
  stackMaxHeightClass = "max-h-[75vh]",
}) => {
  return (
    <div className={`p-2 flex flex-col gap-1 mb-auto ${className}`}>
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
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {calendarModeOptions.map((option) => {
            const isActive = option.value === calendarMode;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onCalendarModeChange?.(option.value)}
                className={`w-full rounded-md px-2.5 py-2 text-xs font-semibold leading-tight transition sm:px-3 sm:text-sm ${
                  isActive
                    ? "bg-[#1F3664] text-white shadow-sm"
                    : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      ) : null}
      <div className={`flex flex-col gap-4 mt-4 ${stackMaxHeightClass}`}>
        <FilterGroup
          label="ENFOQUE"
          name="focus"
          options={focusOptions}
          values={focusFilters}
          setValues={setFocusFilters}
          renderTrailing={focusTrailing}
        />
        <div className="border border-b  border-[#1F3664]"></div>
        <div className="flex flex-col gap-4 overflow-y-auto scrollbar-hide">
        <FilterGroup
          label="VISIBILIDAD"
          name="scope"
          options={scopeOptions}
          values={scopeFilters}
          setValues={setScopeFilters}
          renderTrailing={scopeTrailing}
        />
        <div className="border border-b border-[#EAEAEA]"></div>
        {showEventFilters && (
          <>
            <FilterGroup
              label="CATEGORIA"
              name="tipo-evento"
              options={eventTypeOptions}
              values={eventTypeFilters}
              setValues={setEventTypeFilters}
            />
            <div className="border border-b border-[#EAEAEA]"></div>
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
            />
            <div className="border border-b border-[#EAEAEA]"></div>
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
            {viewerRole === "Coordinador" && calendarMode === "house" ? (
              <SearchableCheckboxDropdown
                label="TRABAJADOR"
                name="absence-employee"
                filteredOptions={filteredAbsenceEmployeeOptions}
                values={absenceEmployeeFilters}
                search={absenceEmployeeSearch}
                selectedLabel={selectedAbsenceEmployeeLabel}
                onSearchChange={setAbsenceEmployeeSearch}
                onToggleValue={toggleAbsenceEmployeeValue}
                onClearSelection={clearAbsenceEmployeeSelection}
              />
            ) : null}
            <FilterGroup
              label="ESTATUS"
              name="absence-status"
              options={absenceStatusOptions}
              values={absenceStatusFilters}
              setValues={setAbsenceStatusFilters}
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
