import TextField from "../atoms/textField";
import VacationDateField from "../atoms/vacationDateField";
import SearchableCheckboxDropdown from "./searchableCheckboxDropdown";
import { sanitizeSearchInput } from "../../utils/searchInput";

const LogsFilters = ({
  searchQuery,
  setSearchQuery,
  actionOptions,
  selectedActionIds,
  actionSearch,
  setActionSearch,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  selectedActionLabel,
  toggleActionValue,
  clearActionSelection,
}) => {
  const handleSearchChange = (value) => {
    setSearchQuery(sanitizeSearchInput(value));
  };

  return (
    <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-4">
        <TextField
          id="logs-search"
          text="Buscar trabajador"
          placeholder="Ingresa al menos 3 letras"
          value={searchQuery}
          setValue={handleSearchChange}
          maxLength={100}
          labelClassName="text-sm font-bold text-[#121212]"
        />

        <SearchableCheckboxDropdown
          label="ACCIONES"
          name="log-actions"
          filteredOptions={actionOptions}
          values={selectedActionIds}
          search={actionSearch}
          selectedLabel={selectedActionLabel}
          onSearchChange={setActionSearch}
          onToggleValue={toggleActionValue}
          onClearSelection={clearActionSelection}
          searchPlaceholder="Buscar acción"
          triggerClassName="text-[#121212]"
        />

        <VacationDateField
          label="Fecha inicial"
          name="startDate"
          value={startDate}
          onChange={onStartDateChange}
          maxDate={endDate ? new Date(`${endDate}T00:00:00`) : undefined}
        />

        <VacationDateField
          label="Fecha final"
          name="endDate"
          value={endDate}
          onChange={onEndDateChange}
          minDate={startDate ? new Date(`${startDate}T00:00:00`) : undefined}
        />
      </div>
    </div>
  );
};

export default LogsFilters;
