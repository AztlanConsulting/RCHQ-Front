import DateField from "../atoms/dateField";
import TextField from "../atoms/textField";
import SearchableCheckboxDropdown from "./searchableCheckboxDropdown";

const HouseLogsFilters = ({
  responsibleQuery,
  setResponsibleQuery,
  affectedQuery,
  setAffectedQuery,
  filteredActionOptions,
  selectedActionIds,
  actionSearch,
  setActionSearch,
  selectedActionLabel,
  toggleActionValue,
  clearActionSelection,
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

        <SearchableCheckboxDropdown
          label="Filtrar por Acción"
          name="house-log-actions"
          filteredOptions={filteredActionOptions}
          values={selectedActionIds}
          search={actionSearch}
          selectedLabel={selectedActionLabel}
          onSearchChange={setActionSearch}
          onToggleValue={toggleActionValue}
          onClearSelection={clearActionSelection}
          searchPlaceholder="Buscar acción"
          triggerClassName="text-[#121212]"
          menuClassName="sm:min-w-[20rem]"
        />

        <DateField
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
