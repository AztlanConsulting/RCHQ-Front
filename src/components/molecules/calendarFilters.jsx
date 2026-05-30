import FilterGroup from "../atoms/filterGroup";
import SearchableCheckboxDropdown from "./searchableCheckboxDropdown";
import Type from "../atoms/type";

const focusTrailing = (opt) =>
  opt?.icon ? (
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
  options,
  value,
  onChange,
}) => (
  <div className="mt-2">
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
  focusOptions = [],
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
  stackMaxHeightClass = "max-h-[calc(100vh-40px)] overflow-y-auto overflow-x-hidden",
  employeeDropdownInline = false,
}) => {
  const toggleFocusFilter = (focusValue, checked) => {
    setFocusFilters((currentValues = []) => {
      if (checked) {
        return currentValues.includes(focusValue)
          ? currentValues
          : [...currentValues, focusValue];
      }

      return currentValues.filter((value) => value !== focusValue);
    });
  };

  const eventFocusOption = focusOptions.find((option) => option.value === "eventos") ?? {
    value: "eventos",
    label: "Eventos",
    icon: "employee",
  };
  const vacationFocusOption = focusOptions.find((option) => option.value === "vacaciones") ?? {
    value: "vacaciones",
    label: "Vacaciones",
    icon: "vacation",
  };
  const absenceFocusOption = focusOptions.find((option) => option.value === "ausencias") ?? {
    value: "ausencias",
    label: "Ausencias",
    icon: "absences",
  };
  const isEventChecked = focusFilters.includes("eventos");
  const isVacationChecked = focusFilters.includes("vacaciones");
  const isAbsenceChecked = focusFilters.includes("ausencias");

  const renderSection = ({ focusOption, checked, content }) => (
    <details className="group w-full" onClick={(event) => !checked && event.preventDefault()}>
      <summary className="flex list-none items-center justify-between gap-3 cursor-pointer">
        <label
          className="flex min-w-0 items-center gap-2"
          onClick={(event) => event.stopPropagation()}
        >
          <input
            type="checkbox"
            checked={checked}
            onChange={(event) => toggleFocusFilter(focusOption.value, event.target.checked)}
            className="h-4 w-4 rounded border-slate-300 accent-slate-800 shrink-0"
          />
          {focusTrailing(focusOption)}
          <Type variant="metric-label" as="span" className="text-sm text-[#121212]">
            {String(focusOption.label).toUpperCase()}
          </Type>
        </label>
        <span aria-hidden className={checked ? "" : "cursor-not-allowed opacity-40"}>
          <svg
            className="h-4 w-4 text-gray-400 transition-transform duration-200 group-open:rotate-180"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </summary>
      {checked ? <div className="mt-4 flex flex-col gap-4">{content}</div> : null}
    </details>
  );

  return (
    <div
      className={`mb-auto flex flex-col gap-1 overflow-x-hidden [scrollbar-gutter:stable] p-2 ${stackMaxHeightClass} ${className}`}
    >
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
              inlinePanel={employeeDropdownInline}
              listMaxHeightClass={
                employeeDropdownInline ? "max-h-28" : "max-h-48"
              }
              triggerClassName={
                employeeDropdownInline ? "!min-h-11 py-1.5 text-sm" : ""
              }
            />
            <FilterSeparator />
          </>
        ) : null}
        <div className="border border-b  border-[#1F3664]"></div>
        <div className="flex flex-col gap-4 overflow-x-hidden overflow-y-auto [scrollbar-gutter:stable] scrollbar-hide">
          {renderSection({
            focusOption: eventFocusOption,
            checked: isEventChecked,
            content: (
              <>
                <FilterGroup
                  label="VISIBILIDAD"
                  name="scope"
                  options={scopeOptions}
                  values={scopeFilters}
                  setValues={setScopeFilters}
                  renderTrailing={scopeTrailing}
                  disabled={!showEventFilters}
                  collapsible={false}
                />
                <FilterGroup
                  label="CATEGORIA"
                  name="tipo-evento"
                  options={eventTypeOptions}
                  values={eventTypeFilters}
                  setValues={setEventTypeFilters}
                  disabled={!showEventFilters}
                  collapsible={false}
                />
              </>
            ),
          })}
          <div className="border border-b border-[#EAEAEA]"></div>
          {renderSection({
            focusOption: vacationFocusOption,
            checked: isVacationChecked,
            content: (
              <FilterGroup
                label="ESTATUS DE VACACIONES"
                name="vacaciones"
                options={vacationStatusOptions}
                values={vacationStatusFilters}
                setValues={setVacationStatusFilters}
                renderTrailing={vacationTrailing}
                disabled={!showVacationFilters}
                collapsible={false}
              />
            ),
          })}
          <div className="border border-b border-[#EAEAEA]"></div>
          {renderSection({
            focusOption: absenceFocusOption,
            checked: isAbsenceChecked,
            content: (
              <>
                <FilterGroup
                  label="TIPO DE AUSENCIA"
                  name="absence-type"
                  options={absenceTypeOptions}
                  values={absenceTypeFilters}
                  setValues={setAbsenceTypeFilters}
                  disabled={!showAbscenceFilters}
                  collapsible={false}
                />
                <FilterGroup
                  label="ESTATUS"
                  name="absence-status"
                  options={absenceStatusOptions}
                  values={absenceStatusFilters}
                  setValues={setAbsenceStatusFilters}
                  renderTrailing={absenceStatusTrailing}
                  disabled={!showAbscenceFilters}
                  collapsible={false}
                />
                <FilterGroup
                  label="EVIDENCIA"
                  name="absence-evidence"
                  options={absenceEvidenceOptions}
                  values={absenceEvidenceFilters}
                  setValues={setAbsenceEvidenceFilters}
                  disabled={!showAbscenceFilters}
                  collapsible={false}
                />
              </>
            ),
          })}
        </div>
      </div>
    </div>
  );
};

export default CalendarFilters;
