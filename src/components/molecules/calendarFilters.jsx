import { useState } from "react";
import FilterGroup from "../atoms/filterGroup";
import Type from "../atoms/type";

const STATUS_OPTIONS = [
  { value: "aprobadas",  label: "Aprobadas" },
  { value: "en_espera",  label: "En espera" },
  { value: "rechazadas", label: "Rechazadas" },
];

const CalendarFilters = ({
  houseName,
  enfoqueFilters,
  setEnfoqueFilters,
  enfoqueOptions,
  scopeFilters,
  setScopeFilters,
  scopeOptions,
  tipoEventoFilters,
  setTipoEventoFilters,
  tipoEventoOptions,
  showTipoEvento,
  showVacaciones,
  showAusencias,
  className = "",
}) => {
  const [vacacionesVals, setVacacionesVals] = useState([]);
  const [ausenciasVals,  setAusenciasVals]  = useState([]);

  return (
    <div className={`p-4 flex flex-col gap-1 ${className}`}>
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
          label="Enfoque"
          name="enfoque"
          options={enfoqueOptions}
          values={enfoqueFilters}
          setValues={setEnfoqueFilters}
        />
        <FilterGroup
          label="Alcance"
          name="alcance"
          options={scopeOptions}
          values={scopeFilters}
          setValues={setScopeFilters}
        />
        {showTipoEvento && (
          <FilterGroup
            label="Tipo de evento"
            name="tipo-evento"
            options={tipoEventoOptions}
            values={tipoEventoFilters}
            setValues={setTipoEventoFilters}
          />
        )}
        {showVacaciones && (
          <FilterGroup
            label="Vacaciones"
            name="vacaciones"
            options={STATUS_OPTIONS}
            values={vacacionesVals}
            setValues={setVacacionesVals}
          />
        )}
        {showAusencias && (
          <FilterGroup
            label="Ausencias"
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
