import DateField from "../atoms/dateField";
import TextField from "../atoms/textField";
import SearchableCheckboxDropdown from "./searchableCheckboxDropdown";
import { sanitizeSearchInput } from "../../utils/searchInput";

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
  const handleResponsibleChange = (value) => {
    setResponsibleQuery(sanitizeSearchInput(value));
  };

  const handleAffectedChange = (value) => {
    setAffectedQuery(sanitizeSearchInput(value));
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="flex flex-col justify-end">
          <TextField
            id="house-logs-responsible"
            text="Buscar por Nombre del responsable"
            placeholder="Ingresa nombre completo o CURP"
            value={responsibleQuery}
            setValue={handleResponsibleChange}
            maxLength={100}
            labelClassName="text-sm font-bold text-[#121212]"
            containerClassName="min-h-[44px] px-3.5"
            inputClassName="text-sm"
          />
        </div>

        <div className="flex flex-col justify-end">
          <TextField
            id="house-logs-affected"
            text="Buscar por Nombre del afectado"
            placeholder="Ingresa nombre completo o CURP"
            value={affectedQuery}
            setValue={handleAffectedChange}
            maxLength={100}
            labelClassName="text-sm font-bold text-[#121212]"
            containerClassName="min-h-[44px] px-3.5"
            inputClassName="text-sm"
          />
        </div>

        <div className="flex flex-col justify-end">
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
            labelClassName="font-bold text-[#121212]"
            triggerClassName="min-h-[44px] px-3.5 py-1.5 text-sm text-[#121212]"
            menuClassName="sm:min-w-[20rem]"
          />
        </div>

        <div className="flex flex-col justify-end">
          <DateField
            label="Filtrar por Fecha"
            name="houseLogsDate"
            value={dateFilter}
            onChange={(event) => setDateFilter(event.target.value)}
            labelColor="text-[#121212]"
            inputWrapperClassName="min-h-[44px]"
            inputClassName="text-sm"
            labelClassName="text-sm"
          />
        </div>
      </div>
    </div>
  );
};

export default HouseLogsFilters;
