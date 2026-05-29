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
  isMobileExpanded,
  onToggleMobileFilters,
}) => {
  const handleSearchChange = (value) => {
    setSearchQuery(sanitizeSearchInput(value));
  };

  return (
    <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-5 lg:p-6">
      <div className="mb-4 sm:hidden">
        <button
          type="button"
          onClick={onToggleMobileFilters}
          className="flex w-full items-center justify-between rounded-lg bg-[#24375e] px-4 py-3 text-left text-sm font-semibold text-white"
          aria-expanded={isMobileExpanded}
          aria-controls="logs-filters-panel"
        >
          <span>{isMobileExpanded ? "Ocultar filtros" : "Mostrar filtros"}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-4 w-4 transition-transform ${isMobileExpanded ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      <div
        id="logs-filters-panel"
        className={`${isMobileExpanded ? "grid" : "hidden"} grid-cols-1 gap-4 sm:grid sm:gap-6 lg:grid-cols-2 xl:grid-cols-4`}
      >
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
