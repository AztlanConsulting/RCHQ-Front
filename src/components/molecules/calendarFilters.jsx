import { useState } from "react";
import FilterGroup from "../atoms/filterGroup";
import Type from "../atoms/type";
import { STATUS_OPTIONS } from "../../utils/calendar.utils";

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
          children={
            <div>

            </div>
          }
        />
        <FilterGroup
          label="ALCANCE"
          name="scope"
          options={scopeOptions}
          values={scopeFilters}
          setValues={setScopeFilters}
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
