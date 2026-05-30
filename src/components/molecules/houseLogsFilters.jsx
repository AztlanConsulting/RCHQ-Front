import DateField from "../atoms/dateField";
import TextField from "../atoms/textField";
import SearchableCheckboxDropdown from "./searchableCheckboxDropdown";
import InlineSearchableCheckboxDropdown from "./inlineSearchableCheckboxDropdown";
import useLogsSearch from "../../hooks/molecules/useLogsSearch";

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
  minDate,
  maxDate,
  isMobileExpanded,
  onToggleMobileFilters,
}) => {
  const {
    inputValue: responsibleInput,
    handleChange: handleResponsibleChange,
    handleKeyDown: handleResponsibleKeyDown,
  } = useLogsSearch(responsibleQuery, setResponsibleQuery);
  const {
    inputValue: affectedInput,
    handleChange: handleAffectedChange,
    handleKeyDown: handleAffectedKeyDown,
  } = useLogsSearch(affectedQuery, setAffectedQuery);

  const actionDropdownProps = {
    label: "Filtrar por Acción",
    name: "house-log-actions",
    filteredOptions: filteredActionOptions,
    values: selectedActionIds,
    search: actionSearch,
    selectedLabel: selectedActionLabel,
    onSearchChange: setActionSearch,
    onToggleValue: toggleActionValue,
    onClearSelection: clearActionSelection,
    searchPlaceholder: "Buscar acción",
    labelClassName: "font-bold text-[#121212]",
    triggerClassName: "min-h-[44px] px-3.5 py-1.5 text-sm text-[#121212]",
    menuClassName: "sm:min-w-[20rem]",
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-5">
      <div className="mb-4 sm:hidden">
        <button
          type="button"
          onClick={onToggleMobileFilters}
          className="flex w-full items-center justify-between rounded-lg bg-[#24375e] px-4 py-3 text-left text-sm font-semibold text-white"
          aria-expanded={isMobileExpanded}
          aria-controls="house-logs-filters-panel"
        >
          <span>
            {isMobileExpanded ? "Ocultar filtros" : "Mostrar filtros"}
          </span>
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
        id="house-logs-filters-panel"
        className={`${isMobileExpanded ? "grid" : "hidden"} grid-cols-1 gap-4 sm:grid md:grid-cols-2 xl:grid-cols-4`}
      >
        <div className="flex flex-col justify-end">
          <TextField
            id="house-logs-responsible"
            text="Buscar por Nombre del responsable"
            placeholder="Ingresa nombre completo o CURP"
            value={responsibleInput}
            setValue={handleResponsibleChange}
            onKeyDown={handleResponsibleKeyDown}
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
            value={affectedInput}
            setValue={handleAffectedChange}
            onKeyDown={handleAffectedKeyDown}
            maxLength={100}
            labelClassName="text-sm font-bold text-[#121212]"
            containerClassName="min-h-[44px] px-3.5"
            inputClassName="text-sm"
          />
        </div>

        <div className="flex flex-col justify-end">
          <div className="sm:hidden">
            <InlineSearchableCheckboxDropdown {...actionDropdownProps} />
          </div>

          <div className="hidden sm:block">
            <SearchableCheckboxDropdown {...actionDropdownProps} />
          </div>
        </div>

        <div className="flex flex-col justify-end">
          <DateField
            label="Filtrar por Fecha"
            name="houseLogsDate"
            value={dateFilter}
            onChange={(event) => setDateFilter(event.target.value)}
            labelColor="text-[#121212]"
            minDate={minDate}
            maxDate={maxDate}
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
