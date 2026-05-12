import { useState } from "react";
import FilterGroup from "../atoms/filterGroup";
import Type from "../atoms/type";
import {
  STATUS_OPTIONS,
} from "../../utils/calendar.utils";

const focusTrailing = (opt) =>
  opt.icon ? (
    <img
      src={`/${opt.icon}.svg`}
      alt=""
      className="h-4 w-4 shrink-0 object-contain"
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
  showEventFilters,
  showVacationFilters,
  showAbscenceFilters,
  className = "",
}) => {
  const [vacacionesVals, setVacacionesVals] = useState([]);
  const [ausenciasVals,  setAusenciasVals]  = useState([]);

  return (
    <div className={`p-2 flex flex-col gap-1 ${className}`}>
      <Type variant="page-title" as="h2">
        Calendario
      </Type>
      {houseName && (
        <Type variant="section-title" as="h2" className="mb-2">
          {houseName}
        </Type>
      )}
      <div className="flex flex-col gap-4 mt-4">
        <FilterGroup
          label="ENFOQUE"
          name="focus"
          options={focusOptions}
          values={focusFilters}
          setValues={setFocusFilters}
          renderTrailing={focusTrailing}
        />
        <FilterGroup
          label="ALCANCE"
          name="scope"
          options={scopeOptions}
          values={scopeFilters}
          setValues={setScopeFilters}
          renderTrailing={scopeTrailing}
        />
        <div className="border border-b"></div>
        {showEventFilters && (
          <FilterGroup
            label="TIPO DE EVENTO"
            name="tipo-evento"
            options={eventTypeOptions}
            values={eventTypeFilters}
            setValues={setEventTypeFilters}
          />
        )}
        {showVacationFilters && (
          <FilterGroup
            label="VACACIONES"
            name="vacaciones"
            options={STATUS_OPTIONS}
            values={vacacionesVals}
            setValues={setVacacionesVals}
          />
        )}
        {showAbscenceFilters && (
          <FilterGroup
            label="AUSENCIAS"
            name="ausencias"
            options={STATUS_OPTIONS}
            values={ausenciasVals}
            setValues={setAusenciasVals}
          />
        )}
      </div>
    </div>
  );
};

export default CalendarFilters;
