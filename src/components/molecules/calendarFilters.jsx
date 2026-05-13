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
  showEventFilters,
  showVacationFilters,
  showAbscenceFilters,
  className = "",
}) => {
  const [vacacionesVals, setVacacionesVals] = useState([]);
  const [ausenciasVals,  setAusenciasVals]  = useState([]);

  return (
    <div className={`p-2 flex flex-col gap-1 mb-auto ${className}`}>
      <Type variant="page-title" as="h2">
        Calendario
      </Type>
      {houseName && (
        <Type variant="section-title" as="h2" className="mb-2">
          {houseName}
        </Type>
      )}
      <div className="flex flex-col gap-4 mt-4 max-h-[75vh]">
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
        {showEventFilters && (
          <>
            <FilterGroup
              label="VISIBILIDAD"
              name="scope"
              options={scopeOptions}
              values={scopeFilters}
              setValues={setScopeFilters}
              renderTrailing={scopeTrailing}
            />
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
              label="VACACIONES"
              name="vacaciones"
              options={STATUS_OPTIONS}
              values={vacacionesVals}
              setValues={setVacacionesVals}
            />
            <div className="border border-b border-[#EAEAEA]"></div>
          </>
          
        )}
        {showAbscenceFilters && (
          <>
            <FilterGroup
              label="AUSENCIAS"
              name="ausencias"
              options={STATUS_OPTIONS}
              values={ausenciasVals}
              setValues={setAusenciasVals}
            />
          </>
        )}
        </div>
      </div>
    </div>
  );
};

export default CalendarFilters;
