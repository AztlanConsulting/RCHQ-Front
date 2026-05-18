import DateField from "../atoms/dateField";
import SelectField from "../atoms/selectField";
import TextField from "../atoms/textField";

const HouseLogsFilters = ({
  responsibleQuery,
  setResponsibleQuery,
  affectedQuery,
  setAffectedQuery,
  actionFilter,
  setActionFilter,
  actionOptions,
  dateFilter,
  setDateFilter,
}) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-4">
        <TextField
          id="house-logs-responsible"
          text="Buscar por Nombre del responsable"
          placeholder="Ingresa un nombre"
          value={responsibleQuery}
          setValue={setResponsibleQuery}
          labelClassName="text-sm font-bold text-[#121212]"
        />

        <TextField
          id="house-logs-affected"
          text="Buscar por Nombre del afectado"
          placeholder="Ingresa un nombre"
          value={affectedQuery}
          setValue={setAffectedQuery}
          labelClassName="text-sm font-bold text-[#121212]"
        />

        <SelectField
          id="house-logs-action"
          label="Filtrar por Acción"
          value={actionFilter}
          onChange={(event) => setActionFilter(event.target.value)}
          options={actionOptions}
          labelColor="text-[#121212]"
        />

        <DateField
          native
          label="Filtrar por Fecha"
          name="houseLogsDate"
          value={dateFilter}
          onChange={(event) => setDateFilter(event.target.value)}
          labelColor="text-[#121212]"
        />
      </div>
    </div>
  );
};

export default HouseLogsFilters;
